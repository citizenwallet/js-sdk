import { Interface, getBytes, id, keccak256, toUtf8Bytes } from "ethers";
import erc20Abi from "../abi/ERC20.abi.json";
import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";
import { CommunityConfig } from "../config";

const erc20Interface = new Interface(erc20Abi);
const cardManagerModuleInterface = new Interface(cardManagerModuleAbi);

export const tokenTransferEventTopic = id("Transfer(address,address,uint256)");

export const tokenTransferCallData = (
  to: string,
  value: bigint
): Uint8Array => {
  return getBytes(erc20Interface.encodeFunctionData("transfer", [to, value]));
};

export const createInstanceCallData = (
  config: CommunityConfig,
  contracts: string[]
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("createInstance", [
      instanceId,
      contracts,
    ])
  );
};

export const updateInstanceContractsCallData = (
  config: CommunityConfig,
  contracts: string[]
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("updateInstanceContracts", [
      instanceId,
      contracts,
    ])
  );
};

export const updateWhitelistCallData = (
  config: CommunityConfig,
  addresses: string[]
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("updateWhitelist", [
      instanceId,
      addresses,
    ])
  );
};

export const callOnCardCallData = (
  config: CommunityConfig,
  hashedSerial: string,
  to: string,
  value: bigint,
  data: Uint8Array
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("callOnCard", [
      instanceId,
      hashedSerial,
      to,
      value,
      data,
    ])
  );
};
