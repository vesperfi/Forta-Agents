import { AbiItem } from "web3-utils";

export const STRATEGY_ABI = [
  {
    inputs: [],
    name: "NAME",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "borrowCToken",
    outputs: [{ internalType: "contract cToken", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "borrowToken",
    outputs: [{ internalType: "contract Token", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "vdToken",
    outputs: [{ internalType: "contract Token", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "supplyCToken",
    outputs: [{ internalType: "contract CToken", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "comptroller",
    outputs: [{ internalType: "contract comptroller", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [], name: "pool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "maxBorrowLimit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "highWater",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "lowWater",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "cm",
    outputs: [{ internalType: "contract ICollateralManager", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "aaveLendingPool",
    outputs: [{ internalType: "contract AaveLendingPool", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as AbiItem[];

export const CTOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "borrowBalanceStored",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "exchangeRateStored",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
] as AbiItem[];

export const ORACLE_ABI = [
  {
    inputs: [{ internalType: "contract JToken", name: "jToken", type: "address" }],
    name: "getUnderlyingPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "oracle",
    outputs: [{ internalType: "contract PriceOracle", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
] as AbiItem[];

export const TRADER_JOE_ABI = [
  {
    constant: true,
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "markets",
    outputs: [
      { internalType: "bool", name: "isListed", type: "bool" },
      { internalType: "uint256", name: "collateralFactorMantissa", type: "uint256" },
      { internalType: "enum JoetrollerV1Storage.Version", name: "version", type: "uint8" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "oracle",
    outputs: [{ internalType: "contract PriceOracle", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
] as AbiItem[];

export const COMPOUND_ABI = [
  {
    constant: true,
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "markets",
    outputs: [
      { internalType: "bool", name: "isListed", type: "bool" },
      { internalType: "uint256", name: "collateralFactorMantissa", type: "uint256" },
      { internalType: "bool", name: "isComped", type: "bool" }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "oracle",
    outputs: [{ internalType: "contract PriceOracle", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
] as AbiItem[];

export const POOL_ABI = [
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "string",
        name: "",
      },
    ],
  },
] as AbiItem[];

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
    stateMutability: "view",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
    stateMutability: "view",
  }
] as AbiItem[];

export const COLLATERAL_MANAGER_ABI = [
  {
    inputs: [{ internalType: "address", name: "_vaultOwner", type: "address" }],
    name: "getVaultInfo",
    outputs: [
      { internalType: "uint256", name: "collateralLocked", type: "uint256" },
      { internalType: "uint256", name: "daiDebt", type: "uint256" },
      { internalType: "uint256", name: "collateralUsdRate", type: "uint256" },
      { internalType: "uint256", name: "collateralRatio", type: "uint256" },
      { internalType: "uint256", name: "minimumDebt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
] as AbiItem[];

export const AAVE_PROVIDER_ABI = [
  {
    name: "getPriceOracle",
    type: "function",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
  },
] as AbiItem[];

export const AAVE_PRICE_ORACLE_ABI = [
  {
    name: "getAssetPrice",
    type: "function",
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address"
      }
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
  }
] as AbiItem[];

export const AAVE_LENDING_POOL_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address"
      }
    ],
    name: "getUserAccountData",
    outputs: [
      {
        internalType: "uint256",
        name: "totalCollateralETH",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "totalDebtETH",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "availableBorrowsETH",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "currentLiquidationThreshold",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "ltv",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "healthFactor",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
] as AbiItem[];  