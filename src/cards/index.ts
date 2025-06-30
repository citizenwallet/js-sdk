import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";
import { type CommunityConfig } from "../config";
import { JsonRpcProvider, Contract, toUtf8Bytes, keccak256 } from "ethers";

export const getCardAddress = async (
  config: CommunityConfig,
  hashedSerial: string,
  options?: { accountFactoryAddress?: string; instanceId?: string }
): Promise<string | null> => {
  const { accountFactoryAddress, instanceId } = options ?? {};

  const rpc = new JsonRpcProvider(config.getRPCUrl(accountFactoryAddress));

  const cardConfig = config.primarySafeCardConfig;

  const contract = new Contract(cardConfig.address, cardManagerModuleAbi, rpc);

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  try {
    const accountAddress = await contract.getFunction("getCardAddress")(
      hashedInstanceId,
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
  options?: { accountFactoryAddress?: string; instanceId?: string }
): Promise<string | null> => {
  const { accountFactoryAddress, instanceId } = options ?? {};

  try {
    const cardConfig = config.primarySafeCardConfig;

    const hashedInstanceId = keccak256(
      toUtf8Bytes(instanceId ?? cardConfig.instance_id)
    );

    const rpc = new JsonRpcProvider(config.getRPCUrl(accountFactoryAddress));

    const contract = new Contract(
      cardConfig.address,
      cardManagerModuleAbi,
      rpc
    );

    const owner = await contract.getFunction("instanceOwner")(hashedInstanceId);

    return owner;
  } catch (error) {
    console.error("Error fetching instance owner:", error);

    return null;
  }
};
