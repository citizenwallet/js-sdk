import { Contract, JsonRpcProvider } from "ethers";
import erc20Abi from "../abi/ERC20.abi.json";
import { CommunityConfig } from "../config";

export const getTokenDecimals = async (
  config: CommunityConfig,
  options?: { tokenAddress?: string; rpcUrl?: string }
): Promise<bigint | null> => {
  const { tokenAddress, rpcUrl } = options ?? {};

  const rpc = new JsonRpcProvider(rpcUrl ?? config.primaryRPCUrl);
  const token = config.getToken(tokenAddress);
  const contract = new Contract(token.address ?? tokenAddress!, erc20Abi, rpc);

  try {
    const decimals = await contract.getFunction("decimals")();
    return decimals;
  } catch (error) {
    console.error("Error fetching token decimals:", error);
    return null;
  }
};

export const getTokenName = async (
  config: CommunityConfig,
  options?: { tokenAddress?: string; rpcUrl?: string }
): Promise<bigint | null> => {
  const { tokenAddress, rpcUrl } = options ?? {};

  const rpc = new JsonRpcProvider(rpcUrl ?? config.primaryRPCUrl);
  const token = config.getToken(tokenAddress);
  const contract = new Contract(token.address ?? tokenAddress!, erc20Abi, rpc);

  try {
    const name = await contract.getFunction("name")();
    return name;
  } catch (error) {
    console.error("Error fetching token name:", error);
    return null;
  }
};

export const getTokenSymbol = async (
  config: CommunityConfig,
  options?: { tokenAddress?: string; rpcUrl?: string }
): Promise<bigint | null> => {
  const { tokenAddress, rpcUrl } = options ?? {};

  const rpc = new JsonRpcProvider(rpcUrl ?? config.primaryRPCUrl);
  const token = config.getToken(tokenAddress);
  const contract = new Contract(token.address ?? tokenAddress!, erc20Abi, rpc);

  try {
    const symbol = await contract.getFunction("symbol")();
    return symbol;
  } catch (error) {
    console.error("Error fetching token symbol:", error);
    return null;
  }
};

export const getTokenMetadata = async (
  config: CommunityConfig,
  options?: { tokenAddress?: string; rpcUrl?: string }
): Promise<{
  decimals: bigint | null;
  name: bigint | null;
  symbol: bigint | null;
} | null> => {
  const { tokenAddress, rpcUrl } = options ?? {};

  try {
    const decimals = await getTokenDecimals(config, { tokenAddress, rpcUrl });
    const name = await getTokenName(config, { tokenAddress, rpcUrl });
    const symbol = await getTokenSymbol(config, { tokenAddress, rpcUrl });

    return {
      decimals,
      name,
      symbol,
    };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
};
