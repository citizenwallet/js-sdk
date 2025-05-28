import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";
import { type CommunityConfig } from "../config";
import { JsonRpcProvider, Contract, toUtf8Bytes, keccak256 } from "ethers";

export const getCardAddress = async (
  config: CommunityConfig,
  hashedSerial: string,
  accountFactoryAddress?: string
): Promise<string | null> => {
  const rpc = new JsonRpcProvider(config.getRPCUrl(accountFactoryAddress));

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

export const instanceOwner = async (
  config: CommunityConfig,
  accountFactoryAddress?: string
): Promise<string | null> => {
  try {
    const cardConfig = config.primarySafeCardConfig;

    const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

    const rpc = new JsonRpcProvider(config.getRPCUrl(accountFactoryAddress));

    const contract = new Contract(
      cardConfig.address,
      cardManagerModuleAbi,
      rpc
    );

    const owner = await contract.getFunction("instanceOwner")(instanceId);

    return owner;
  } catch (error) {
    console.error("Error fetching instance owner:", error);

    return null;
  }
};
