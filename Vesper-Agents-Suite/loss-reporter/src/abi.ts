import { AbiItem } from "web3-utils";

export const earningReportedSignature =
  "EarningReported(address,uint256,uint256,uint256,uint256,uint256,uint256)";

export const REPORT_LOSS_ABI = {
  name: "reportLoss",
  type: "function",
  inputs: [
    {
      type: "address",
      name: "",
    },
    {
      type: "uint256",
      name: "",
    },
  ],
} as AbiItem;

export const STRATEGY_ABI = [
  {
    inputs: [],
    name: "pool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as AbiItem[];

export const POOL_ABI = [
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "uint8",
        name: "",
      },
    ],
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalDebt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{internalType:"address",name:"_strategy",type:"address"}],
    name: "totalDebtOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
] as AbiItem[];


export const ROUTER_ABI = [
  {
    name: "getAmountsOut",
    type: "function",
    inputs: [{
      internalType: "uint256",
      name: "amountIn",
      type: "uint256"
    },
    {
      internalType: "address[]",
      name: "path",
      type: "address[]"
    },
    ],
    outputs: [
      {
        internalType: "uint256[]",
        type: "uint256[]",
        name: "amounts",
      },
    ],
  }
] as AbiItem[];