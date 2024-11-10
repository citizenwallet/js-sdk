import accountFactoryAbi from "../abi/AccountFactory.abi.json" with { type: "json" };
import { type CommunityConfig } from "../config";
import { JsonRpcProvider, Contract } from "ethers";

export const getAccountAddress = async (
  config: CommunityConfig,
  address: string,
  salt: bigint = BigInt(0)
): Promise<string | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

    const contract = new Contract(
      config.primaryAccountConfig.account_factory_address,
      accountFactoryAbi,
      rpc
    );

  try {
    const accountAddress = await contract.getFunction("getAddress")(
      address,
      salt
    );

    return accountAddress;
    } catch (error) {
      console.error("Error fetching account address:", error);

        return null;
    }
};
