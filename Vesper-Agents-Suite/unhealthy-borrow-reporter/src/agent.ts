import Web3 from "web3";
import LRU from "lru-cache";

import { TimeTracker, VesperFetcher } from 'vesper-forta-module';
import { getJsonRpcUrl } from "forta-agent";
import { BlockEvent, Finding, HandleBlock } from "forta-agent";
import {
  STRATEGY_ABI, CTOKEN_ABI, ORACLE_ABI, TRADER_JOE_ABI, COMPOUND_ABI,
  POOL_ABI, COLLATERAL_MANAGER_ABI, AAVE_PROVIDER_ABI, AAVE_LENDING_POOL_ABI,
  ERC20_ABI, AAVE_PRICE_ORACLE_ABI
} from "./abi";
import { createFinding, contains } from "./utils";
import BigNumber from "bignumber.js";
const STRATEGY_KEY = "_Strategies"
const COMPOUND_STRATEGIES = ["BenqiXYStrategy", "TraderJoeXYStrategy", "CompoundXYStrategy", "IronBankXYStrategy"]
const AAVE_STRATEGIES = ["AaveXYStrategy"]
const MAKER_STRATEGIES = ["MakerStrategy", "Maker-Strategy"]
const TRADER_JOE = 'TraderJoe'
const web3: Web3 = new Web3(getJsonRpcUrl());
const cache: LRU<string, string[]> = new LRU<string, string[]>({ max: 100 });
const tracker: TimeTracker = new TimeTracker();
const vesperFetcher: VesperFetcher = new VesperFetcher(web3);
let cacheTime: number = 3600000; // one hour in milliseconds
const DECIMAL18 = new BigNumber('1e18')
const MAX_BPS = 10000

const fetchMakerStrategies = async (
  strategyContract: any,
  strategyAddress: string,
  blockNumber: string
): Promise<any> => {
  return Promise.all([
    strategyContract.methods.cm().call({}, blockNumber),
    strategyContract.methods.lowWater().call({}, blockNumber)]).then(function ([
      collateralManager,
      lowWater,
    ]) {
      const cmContract = new web3.eth.Contract(COLLATERAL_MANAGER_ABI, collateralManager);
      return cmContract.methods.getVaultInfo(strategyAddress).call({}, blockNumber).then(function (vaultInfo: any) {
        const collateralRatio = new BigNumber(vaultInfo.collateralRatio)
        return collateralRatio.isGreaterThan(0) && collateralRatio.isLessThan(lowWater)
      })
    })
}
const fetchCompoundStrategies = async (
  strategyContract: any,
  strategyAddress: string,
  strategyName: string,
  blockNumber: string
): Promise<any> => {
  return Promise.all([
    strategyContract.methods.borrowCToken().call({}, blockNumber),
    strategyContract.methods.supplyCToken().call({}, blockNumber),
    strategyContract.methods.comptroller().call({}, blockNumber)
  ]).then(async function ([borrowCTokenAddress, supplyCTokenAddress, comptrollerAddress]) {
    const borrowCToken = new web3.eth.Contract(CTOKEN_ABI, borrowCTokenAddress);
    const supplyCToken = new web3.eth.Contract(CTOKEN_ABI, supplyCTokenAddress);
    const actualComptrollerAbi = strategyName.includes(TRADER_JOE) ? TRADER_JOE_ABI : COMPOUND_ABI
    const comptrollerContract = new web3.eth.Contract(actualComptrollerAbi, comptrollerAddress);
    const oracleAddress: string = await comptrollerContract.methods.oracle().call({}, blockNumber);
    const oracleContract = new web3.eth.Contract(ORACLE_ABI, oracleAddress);
    return Promise.all([
      oracleContract.methods.getUnderlyingPrice(borrowCTokenAddress).call({}, blockNumber),
      oracleContract.methods.getUnderlyingPrice(supplyCTokenAddress).call({}, blockNumber),
      borrowCToken.methods.borrowBalanceStored(strategyAddress).call({}, blockNumber),
      supplyCToken.methods.balanceOf(strategyAddress).call({}, blockNumber),
      supplyCToken.methods.exchangeRateStored().call({}, blockNumber),
      comptrollerContract.methods.markets(supplyCTokenAddress).call({}, blockNumber),
      strategyContract.methods.maxBorrowLimit().call({}, blockNumber)
    ]).then(function ([borrowTokenPrice, supplyTokenPrice, borrowed, supplyBalance, supplyTokenExchangeRate, config, maxBorrowLimit]) {
      const cf = config.collateralFactorMantissa
      // Check unhealthy borrow
      const collateralSupplied = new BigNumber(supplyBalance).multipliedBy(new BigNumber(supplyTokenExchangeRate)).dividedBy(DECIMAL18)
      const maxBorrowPossible = collateralSupplied
        .multipliedBy(new BigNumber(cf))
        .dividedBy(DECIMAL18)
        .multipliedBy(new BigNumber(supplyTokenPrice))
        .dividedBy(new BigNumber(borrowTokenPrice))
      const borrowUpperBound = new BigNumber(maxBorrowPossible).multipliedBy(new BigNumber(maxBorrowLimit)).dividedBy(MAX_BPS)
      return Boolean(new BigNumber(borrowed).isGreaterThan(borrowUpperBound))
    })
  })
}

const fetchAaveStrategies = async (
  strategyContract: any,
  strategyAddress: string,
  blockNumber: string
): Promise<any> => {
  return Promise.all([
    vesperFetcher.getAaveAddressProvider(),
    strategyContract.methods.aaveLendingPool().call({}, blockNumber),
    strategyContract.methods.borrowToken().call({}, blockNumber),
    strategyContract.methods.vdToken().call({}, blockNumber)
  ]).then(async function ([addressProvider, lendingPool, borrowTokenAddress, vdTokenAddress]) {
    const aaveAddressProvider = new web3.eth.Contract(AAVE_PROVIDER_ABI, addressProvider);
    const aaveLendingPool = new web3.eth.Contract(AAVE_LENDING_POOL_ABI, lendingPool);
    const borrowToken = new web3.eth.Contract(ERC20_ABI, borrowTokenAddress);
    const vdToken = new web3.eth.Contract(ERC20_ABI, vdTokenAddress);
    const oracleAddress = await aaveAddressProvider.methods.getPriceOracle().call({}, blockNumber)
    const aaveOracle = new web3.eth.Contract(AAVE_PRICE_ORACLE_ABI, oracleAddress);
    return Promise.all([
      aaveLendingPool.methods.getUserAccountData(strategyAddress).call({}, blockNumber),
      aaveOracle.methods.getAssetPrice(borrowTokenAddress).call({}, blockNumber),
      borrowToken.methods.decimals().call({}, blockNumber),
      strategyContract.methods.maxBorrowLimit().call({}, blockNumber),
      vdToken.methods.balanceOf(strategyAddress).call({}, blockNumber)
    ]).then(function ([strategyAccountData, borrowTokenPrice, borrowTokenDecimal, maxBorrowLimit, borrowed]) {
       // Check unhealthy borrow
      const maxBorrowPossibleETH = new BigNumber(strategyAccountData.totalDebtETH).plus(new BigNumber(strategyAccountData.availableBorrowsETH))
      const maxBorrowPossibleInBorrowToken = new BigNumber(maxBorrowPossibleETH
        .multipliedBy(new BigNumber('1e' + borrowTokenDecimal))
        .dividedBy(borrowTokenPrice))
      const borrowUpperBound = maxBorrowPossibleInBorrowToken.multipliedBy(maxBorrowLimit).dividedBy(MAX_BPS)
      return Boolean(new BigNumber(borrowed).isGreaterThan(borrowUpperBound))
    })
  })
}

const fetchStrategies = async (
  blockNumber: string
): Promise<string[]> => {
  if (blockNumber != "latest" && cache.get(blockNumber) !== undefined) {
    return cache.get(blockNumber) as string[];
  }
  let [V3] = await Promise.all([
    vesperFetcher.getStrategiesV3(blockNumber)
  ]);
  V3 = Array.from(new Set<string>(V3));
  const valueV3promise = V3.map(async (strategyAddress: string) => {
    const strategyContract = new web3.eth.Contract(STRATEGY_ABI, strategyAddress);
    const strategyName: string = await strategyContract.methods.NAME().call({}, blockNumber);
    // Handle compound or it's forked XY Strategies 
    if (contains(COMPOUND_STRATEGIES, strategyName)) {
      return fetchCompoundStrategies(strategyContract, strategyAddress, strategyName, blockNumber)
    }
    else if (contains(AAVE_STRATEGIES, strategyName)) {
      // Handle aave XY strategy
      return fetchAaveStrategies(strategyContract, strategyAddress, blockNumber)
    }
    else if (contains(MAKER_STRATEGIES, strategyName)) {
      // Maker strategy
      return fetchMakerStrategies(strategyContract, strategyAddress, blockNumber)
    }
    return BigInt(0);
  });

  const allValue = (await Promise.all([
    valueV3promise,
  ].flat()));
  const allStrategies: string[] = V3;

  const validStrategy: string[] = allStrategies.filter(
    (_: string, idx: number) => allValue[idx] > BigInt(0),
  );

  cache.set(blockNumber, validStrategy);
  return validStrategy;
};

const getStrategies = async (blockNumber: string) => {
  const currentTime = Date.now()
  const [success, time] = tracker.tryGetLastTime(STRATEGY_KEY);
  if (!success || (currentTime - time >= cacheTime)) {
    const strategies = await fetchStrategies(blockNumber);
    tracker.update(STRATEGY_KEY, currentTime);
    cache.set(STRATEGY_KEY, strategies)
    return strategies;
  }
  return cache.get(STRATEGY_KEY)
}

export const strategyHandler = (
  web3: Web3,
  timeThreshold: number,
  tracker: TimeTracker
): HandleBlock => {
  return async (blockEvent: BlockEvent) => {
    const findings: Finding[] = [];
    const blockNumber = blockEvent.blockNumber + ''
    const strategies = await getStrategies(blockNumber);
    if (strategies) {
      for (let strategy of strategies) {
        const [success, time] = tracker.tryGetLastTime(strategy);
        if (!success) {
          // set this block as the time to start tracking the strategy
          tracker.update(strategy, blockEvent.block.timestamp);
        };
        const elapsed: number = blockEvent.block.timestamp - time;
        if (elapsed >= timeThreshold) {
          tracker.update(strategy, blockEvent.block.timestamp);
          const strategyContract = new web3.eth.Contract(STRATEGY_ABI, strategy);
          const poolAddress = await strategyContract.methods.pool().call({}, blockNumber)
          const poolContract = new web3.eth.Contract(POOL_ABI, poolAddress);
          const metadata = {
            network: await vesperFetcher.getNetworkName(),
            strategyName: await strategyContract.methods.NAME().call({}, blockNumber),
            strategyAddress: strategy.toString(),
            poolName: await poolContract.methods.name().call({}, blockNumber),
            poolAddress
          }
          findings.push(
            createFinding(metadata)
          );
        }
      }
    }
    return findings;
  };
};

export default {
  handleBlock: strategyHandler(web3, cacheTime, tracker)
};
