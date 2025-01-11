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

export const createInstance = async (
  signer: Wallet,
  config: CommunityConfig
): Promise<string | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const connectedSigner = signer.connect(rpc);

  const cardConfig = config.primarySafeCardConfig;

  const contract = new Contract(cardConfig.address, cardManagerModuleAbi, rpc);

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  let owner: string | null = null;
  try {
    owner = await contract.getFunction("instanceOwner")(instanceId);

    if (owner !== ZeroAddress) {
      return owner;
    }

    const tx = await contract.getFunction("createInstance")(instanceId);

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      return null;
    }

    owner = await contract.getFunction("instanceOwner")(instanceId);
  } catch (error) {
    console.error("Error creating instance:", error);
  }

  return owner;
};

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

export const callOnCard = async (
  signer: Wallet,
  config: CommunityConfig,
  hashedSerial: string,
  to: string,
  value: bigint,
  data: Uint8Array,
  customRpc?: JsonRpcProvider
): Promise<string | null> => {
  const rpc = customRpc ?? new JsonRpcProvider(config.primaryRPCUrl);

  const connectedSigner = signer.connect(rpc);

  const cardConfig = config.primarySafeCardConfig;

  const contract = new Contract(
    cardConfig.address,
    cardManagerModuleAbi,
    connectedSigner
  );

  const instanceId = keccak256(toUtf8Bytes(cardConfig.instance_id));

  try {
    const tx = await contract.getFunction("callOnCard")(
      instanceId,
      hashedSerial,
      to,
      value,
      data
    );

    return tx;
  } catch (error) {
    console.error("Error fetching account address:", error);

    return null;
  }
};

// export const getAccountBalance = async (
//   config: CommunityConfig,
//   address: string
// ): Promise<bigint | null> => {
//   const rpc = new JsonRpcProvider(config.primaryRPCUrl);
//   const contract = new Contract(config.primaryToken.address, erc20Abi, rpc);

//   try {
//     const balance = await contract.getFunction("balanceOf")(address);

//     return balance;
//   } catch (error) {
//     console.error("Error fetching account balance:", error);

//     return null;
//   }
// };

// export const verifyAccountOwnership = async (
//   config: CommunityConfig,
//   accountAddress: string,
//   message: string,
//   signature: string
// ): Promise<boolean> => {
//   const recoveredAddress = verifyMessage(message, signature);
//   if (recoveredAddress.toLowerCase() === accountAddress.toLowerCase()) {
//     return true;
//   }

//   try {
//     const rpc = new JsonRpcProvider(config.primaryRPCUrl);
//     const contract = new Contract(accountAddress, accountAbi, rpc);

//     // Check if isValidSignature is implemented by calling it
//     try {
//       const hash = hashMessage(message);
//       const magicValue = await contract.getFunction("isValidSignature")(
//         hash,
//         signature
//       );

//       if (magicValue === "0x1626ba7e") {
//         return true;
//       }
//     } catch (error) {
//       console.warn(error);
//       // Function is not implemented
//       console.warn("isValidSignature is not implemented on this contract");

//       const owner = await contract.getFunction("owner")();

//       if (owner.toLowerCase() !== accountAddress.toLowerCase()) {
//         return false;
//       }
//     }

//     const safeContract = new Contract(accountAddress, safeAccountAbi, rpc);

//     const isOwner = await safeContract.getFunction("isOwner")(recoveredAddress);

//     return isOwner;
//   } catch (error) {
//     console.error("Error verifying account ownership:", error);
//   }

//   return false;
// };
