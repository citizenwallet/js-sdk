import { Interface, getBytes, id, keccak256, toUtf8Bytes } from "ethers";
import erc20Abi from "../abi/ERC20.abi.json";
import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";
import { CommunityConfig } from "../config";

const erc20Interface = new Interface(erc20Abi);
const cardManagerModuleInterface = new Interface(cardManagerModuleAbi);

export const tokenTransferEventTopic = id("Transfer(address,address,uint256)");
export const tokenTransferSingleEventTopic = id(
  "TransferSingle(address,address,address,uint256,uint256)"
);

export const roleGrantedEventTopic = id("RoleGranted(bytes32,address,address)");
export const roleRevokedEventTopic = id("RoleRevoked(bytes32,address,address)");

export const tokenTransferCallData = (
  to: string,
  value: bigint
): Uint8Array => {
  return getBytes(erc20Interface.encodeFunctionData("transfer", [to, value]));
};

export const tokenMintCallData = (to: string, value: bigint): Uint8Array => {
  return getBytes(erc20Interface.encodeFunctionData("mint", [to, value]));
};

export const createInstanceCallData = (
  config: CommunityConfig,
  contracts: string[],
  instanceId?: string
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("createInstance", [
      hashedInstanceId,
      contracts,
    ])
  );
};

export const updateInstanceContractsCallData = (
  config: CommunityConfig,
  contracts: string[],
  instanceId?: string
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("updateInstanceContracts", [
      hashedInstanceId,
      contracts,
    ])
  );
};

export const updateWhitelistCallData = (
  config: CommunityConfig,
  addresses: string[],
  instanceId?: string
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("updateWhitelist", [
      hashedInstanceId,
      addresses,
    ])
  );
};

export const callOnCardCallData = (
  config: CommunityConfig,
  hashedSerial: string,
  to: string,
  value: bigint,
  data: Uint8Array,
  instanceId?: string
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("callOnCard", [
      hashedInstanceId,
      hashedSerial,
      to,
      value,
      data,
    ])
  );
};

export const addOwnerCallData = (
  config: CommunityConfig,
  hashedSerial: string,
  newOwner: string,
  instanceId?: string
): Uint8Array => {
  const cardConfig = config.primarySafeCardConfig;

  const hashedInstanceId = keccak256(
    toUtf8Bytes(instanceId ?? cardConfig.instance_id)
  );

  return getBytes(
    cardManagerModuleInterface.encodeFunctionData("addOwner", [
      hashedInstanceId,
      hashedSerial,
      newOwner,
    ])
  );
};

export const generateCalldataLink = (
  baseUrl: string,
  config: CommunityConfig,
  address: string,
  value: bigint,
  calldata: string
): string => {
  const alias = config.community.alias;

  const url = `${baseUrl}/?alias=${alias}&address=${address}&value=${value}&calldata=${calldata}`;

  return url;
};
