import { JsonRpcProvider } from "ethers";

import { CommunityConfig } from "../config";

export const waitForTxSuccess = async (
  config: CommunityConfig,
  txHash: string
): Promise<boolean> => {
  try {
    const rpc = new JsonRpcProvider(config.primaryRPCUrl);

    const receipt = await rpc.waitForTransaction(txHash);
    if (!receipt) {
      throw new Error("Transaction not found");
    }

    return receipt.status === 1;
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    return false;
  }
};
