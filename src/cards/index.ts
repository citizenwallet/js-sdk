import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";
import { type CommunityConfig } from "../config";
import {
  JsonRpcProvider,
  Contract,
  toUtf8Bytes,
  keccak256,
  Wallet,
  ZeroAddress,
} from "ethers";

export const getCardAddress = async (
  config: CommunityConfig,
  hashedSerial: string
): Promise<string | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const cardConfig = config.primarySafeCardConfig;

  const contract = new Contract(cardConfig.address, cardManagerModuleAbi, rpc);

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  try {
    const accountAddress = await contract.getFunction("getCardAddress")(
      instanceId,
      hashedSerial
    );

    return accountAddress;
  } catch (error) {
    console.error("Error fetching account address:", error);

    return null;
  }
};
