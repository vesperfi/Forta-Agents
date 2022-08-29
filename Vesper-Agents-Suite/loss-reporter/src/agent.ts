import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  getJsonRpcUrl,
} from "forta-agent";
import {
  provideFunctionCallsDetectorHandler,
  provideEventCheckerHandler,
} from "forta-agent-tools";
import {
  createFindingCallDetector,
  createFindingEventDetector,
  hasLosses,
} from "./utils";
import { VesperFetcher } from 'vesper-forta-module';
import BigNumber from "bignumber.js";
import Web3 from "web3";
const web3: Web3 = new Web3(getJsonRpcUrl());
const vesperFetcher: VesperFetcher = new VesperFetcher(web3);
import { REPORT_LOSS_ABI, STRATEGY_ABI, POOL_ABI, ROUTER_ABI, earningReportedSignature } from "./abi";
const REPORT_LOSS_LIMIT = 50 // Report loss above 50 USD

async function getContracts() {
  const network = await vesperFetcher.getNetworkName()
  // mainnet
  let nativeToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  let router = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
  let usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  if (network === 'Avalanche') {
    nativeToken = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
    router = '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'
    usdc = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
  }
  return { nativeToken, router, usdc }
}

export const provideHandleTransaction = (web3: Web3): HandleTransaction => {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const poolAccountant: string[] = await vesperFetcher.getPoolAccountants(
      txEvent.blockNumber
    )
    const reportLossHandlers: HandleTransaction[] = poolAccountant.map(
      (poolAccountant) =>
        provideFunctionCallsDetectorHandler(
          createFindingCallDetector,
          REPORT_LOSS_ABI,
          {
            to: poolAccountant,
            filterOnArguments: (args: { [key: string]: any }): boolean => {
              return args[1] > 0
            }
          }
        )
    );

    const reportEarningEventWithLoss: HandleTransaction[] = poolAccountant.map(
      (poolAccountant) =>
        provideEventCheckerHandler(
          createFindingEventDetector,
          earningReportedSignature,
          poolAccountant,
          hasLosses
        )
    );

    let findings: Finding[] = [];

    for (let reportLossHandler of reportLossHandlers) {
      const result = await reportLossHandler(txEvent)
      findings = findings.concat(result);
    }

    for (let reportEarningReportedEvent of reportEarningEventWithLoss) {
      findings = findings.concat(await reportEarningReportedEvent(txEvent));
    }

    let findingsWithMetadata: Finding[] = [];
    for (let finding of findings) {
      const metadata = await vesperFetcher.getMetaData(finding.metadata.strategyAddress, txEvent.blockNumber)
      const strategyContract = new web3.eth.Contract(STRATEGY_ABI, finding.metadata.strategyAddress);
      const poolAddress = await strategyContract.methods.pool().call({});
      const poolContract = new web3.eth.Contract(POOL_ABI, poolAddress);
      const collateralToken = await poolContract.methods.token().call({});
      const strategyDebt = await poolContract.methods.totalDebtOf(finding.metadata.strategyAddress).call({}, txEvent.blockNumber);
      const strategyLossInTvl = strategyDebt > 0 ? new BigNumber(finding.metadata.lossValue).multipliedBy(100).dividedBy(strategyDebt) : 0
      const collateralContract = new web3.eth.Contract(POOL_ABI, collateralToken);
      const decimals = await collateralContract.methods.decimals().call({});
      const symbol = await collateralContract.methods.symbol().call({});

      const lossInCollateral = new BigNumber(finding.metadata.lossValue).dividedBy(new BigNumber('1e' + decimals.toString()))
      const { nativeToken, router, usdc } = await getContracts()
      const routerContract = new web3.eth.Contract(ROUTER_ABI, router);
      const path = web3.utils.toChecksumAddress(collateralToken) === web3.utils.toChecksumAddress(nativeToken)
        ? [collateralToken, usdc]
        : [collateralToken, nativeToken, usdc]
      const amountsOut = await routerContract.methods.getAmountsOut(finding.metadata.lossValue, path).call({})
      const lossInUSDC = amountsOut[path.length - 1]
      const lossInUSD = new BigNumber(lossInUSDC).dividedBy(new BigNumber('1e6'))
      if (lossInUSD.gt(REPORT_LOSS_LIMIT)) { // raise alert only when loss > REPORT_LOSS_ABOVE USD
        const description = `${finding.description} ${metadata.strategyName} of ${metadata.poolName}.\n lossInCollateral = ${lossInCollateral} ${symbol}\n 
        lossInUSD = $${lossInUSD.toFixed(0)}\n lossOfStrategyTVL = ${strategyLossInTvl.toFixed(2)}%\n strategyAddress = ${metadata.strategyAddress}\n 
        poolAddress = ${metadata.poolAddress}\n network = ${metadata.network}`
        const findingWithMetadata = { ...finding, description }
        findingsWithMetadata = findingsWithMetadata.concat(Finding.fromObject(findingWithMetadata));
      }
    }
    return findingsWithMetadata;
  };
};

export default {
  handleTransaction: provideHandleTransaction(web3),
};
