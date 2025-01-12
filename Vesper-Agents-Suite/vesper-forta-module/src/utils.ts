import {
  encodeFunctionCall,
  decodeParameters,
} from "forta-agent-tools";
import { providers } from "ethers";
import { AbiItem } from "web3-utils";

export type Fetcher = (block: number | string, ...params: string[]) => Promise<any>;

export const createFetcher = (
  web3Call: any,
  address: string,
  jsonInteface: AbiItem,
): Fetcher =>
  async (block: number | string, ...params: string[]): Promise<any> => {
    const encodedValue = await web3Call({
      to: address,
      data: encodeFunctionCall(jsonInteface, params),
    }, block);
    return decodeParameters(jsonInteface.outputs as any[], encodedValue);
  };

export function provideGetNetworkId(
  ethersProvider: providers.JsonRpcProvider
): Promise<number> {
  return ethersProvider.send(
    'net_version',
    []
  )
}