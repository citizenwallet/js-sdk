import accountFactoryAbi from "../abi/AccountFactory.abi.json";
import erc20Abi from "../abi/ERC20.abi.json";
import accountAbi from "../abi/Account.abi.json";
import safeAccountAbi from "../abi/Safe.abi.json";
import { type CommunityConfig } from "../config";
import {
  JsonRpcProvider,
  Contract,
  verifyMessage,
  hashMessage,
  getBytes,
} from "ethers";

export const getENSAddress = async (
  mainnetRpcUrl: string,
  domain: string
): Promise<string | null> => {
  try {
    const provider = new JsonRpcProvider(mainnetRpcUrl);
    const address = await provider.resolveName(domain);
    return address;
  } catch (error) {
    console.error("Failed to resolve ENS name", error);
    return null;
  }
};

export const getAccountAddress = async (
  config: CommunityConfig,
  address: string,
  salt: bigint = BigInt(0),
  accountFactoryAddress?: string
): Promise<string | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
    config.getAccountConfig(accountFactoryAddress).account_factory_address,
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

export const getAccountBalance = async (
  config: CommunityConfig,
  address: string
): Promise<bigint | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);
  const contract = new Contract(config.primaryToken.address, erc20Abi, rpc);

  try {
    const balance = await contract.getFunction("balanceOf")(address);

    return balance;
  } catch (error) {
    console.error("Error fetching account balance:", error);

    return null;
  }
};

export const verifyAccountOwnership = async (
  config: CommunityConfig,
  accountAddress: string,
  message: string,
  signature: string
): Promise<boolean> => {
  const recoveredAddress = verifyMessage(
    message.startsWith("0x") ? getBytes(message) : message,
    signature
  );
  if (recoveredAddress.toLowerCase() === accountAddress.toLowerCase()) {
    return true;
  }

  try {
    const rpc = new JsonRpcProvider(config.primaryRPCUrl);
    const contract = new Contract(accountAddress, accountAbi, rpc);

    // Check if isValidSignature is implemented by calling it
    try {
      const hash = hashMessage(message);
      const magicValue = await contract.getFunction("isValidSignature")(
        hash,
        signature
      );

      if (magicValue === "0x1626ba7e") {
        return true;
      }
    } catch (error) {
      console.warn(error);
      // Function is not implemented
      console.warn("isValidSignature is not implemented on this contract");
    }

    try {
      const owner = await contract.getFunction("owner")();

      if (owner.toLowerCase() !== accountAddress.toLowerCase()) {
        return false;
      }
    } catch (error) {
      console.warn("owner function not implemented or failed:", error);
      // If owner function doesn't exist or fails, we continue with other checks
    }

    const safeContract = new Contract(accountAddress, safeAccountAbi, rpc);

    const isOwner = await safeContract.getFunction("isOwner")(recoveredAddress);

    return isOwner;
  } catch (error) {
    console.error("Error verifying account ownership:", error);
  }

  return false;
};

export const isSafeOwner = async (
  config: CommunityConfig,
  accountAddress: string,
  ownerAddress: string
): Promise<boolean> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);
  const contract = new Contract(accountAddress, safeAccountAbi, rpc);

  try {
    const isOwner = await contract.getFunction("isOwner")(ownerAddress);

    return isOwner;
  } catch (error) {
    console.error("Error verifying safe owner:", error);

    return false;
  }
};
