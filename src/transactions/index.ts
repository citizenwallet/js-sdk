import { JsonRpcProvider } from "ethers";

import { CommunityConfig } from "../config";

export const waitForTxSuccess = async (
  config: CommunityConfig,
  txHash: string,
  timeout: number = 12000,
  options?: { accountFactoryAddress?: string }
): Promise<boolean> => {
  const { accountFactoryAddress } = options ?? {};

  try {
    const rpc = new JsonRpcProvider(config.getRPCUrl(accountFactoryAddress));

    const receipt = await rpc.waitForTransaction(txHash, 1, timeout);
    if (!receipt) {
      throw new Error("Transaction not found");
    }

    return receipt.status === 1;
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    return false;
  }
};
