export interface Network {
  chainId: number;
  name: string;
  symbol: string;
  explorer: string;
  rpcUrl: string;
  wsRpcUrl: string;
}

interface Networks {
  [key: string]: Network;
}

export const NETWORKS: Networks = {
  "100": {
    chainId: 100,
    name: "Gnosis",
    symbol: "xDAI",
    explorer: "https://gnosisscan.io",
    rpcUrl: "https://100.engine.citizenwallet.xyz",
    wsRpcUrl: "wss://100.engine.citizenwallet.xyz",
  },
  "137": {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    explorer: "https://polygonscan.com",
    rpcUrl: "https://137.engine.citizenwallet.xyz",
    wsRpcUrl: "wss://137.engine.citizenwallet.xyz",
  },
  "8453": {
    chainId: 8453,
    name: "Base",
    symbol: "Ether",
    explorer: "https://basescan.org/",
    rpcUrl: "https://8453.engine.citizenwallet.xyz",
    wsRpcUrl: "wss://8453.engine.citizenwallet.xyz",
  },
  "42220": {
    chainId: 42220,
    name: "CELO",
    symbol: "CELO",
    explorer: "https://celoscan.io",
    rpcUrl: "https://42220.engine.citizenwallet.xyz",
    wsRpcUrl: "wss://42220.engine.citizenwallet.xyz",
  },
  "42161": {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "Ether",
    explorer: "https://arbiscan.io",
    rpcUrl: "https://42161.engine.citizenwallet.xyz",
    wsRpcUrl: "wss://42161.engine.citizenwallet.xyz",
  },
};
