import {
  id,
  keccak256,
  AbiCoder,
  verifyMessage,
  getBytes,
  Wallet,
  Interface,
  JsonRpcProvider,
  Contract,
} from "ethers";
import { CommunityConfig } from "../config";
import { BundlerService } from "../bundler";
import sessionManagerModuleJson from "../abi/SessionManagerModule.json";
import twoFAFactoryJson from "../abi/TwoFAFactory.json";

const sessionManagerInterface = new Interface(sessionManagerModuleJson.abi);
const twoFAFactoryInterface = new Interface(twoFAFactoryJson.abi);

/**
 * Generates a unique salt for a session based on a source and type.
 * The salt is created by hashing the concatenated source and type with a colon separator.
 *
 * @param {string} params.source - The source identifier for the session
 * @param {string} params.type - The type identifier for the session
 * @returns {string} A bytes32 hash of the source and type combination
 */
export const generateSessionSalt = ({
  source,
  type,
}: {
  source: string;
  type: string;
}): string => {
  return id(`${source}:${type}`);
};

/**
 * Generates a hash for a session request by encoding and hashing the session parameters.
 * Uses ABI encoding to ensure compatibility with the Dart implementation.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig
 * @param {string} params.sessionOwner - The address of the session owner (address of private key)
 * @param {string} params.salt - The unique salt generated for this session
 * @param {number} params.expiry - UTC timestamp in seconds when the session expires
 * @returns {string} A bytes32 hash of the encoded session request parameters
 */
export const generateSessionRequestHash = ({
  community,
  sessionOwner,
  salt,
  expiry,
}: {
  community: CommunityConfig;
  sessionOwner: string;
  salt: string;
  expiry: number;
}): string => {
  const sessionProvider = community.primarySessionConfig.provider_address;

  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ["address", "address", "bytes32", "uint48"],
    [sessionProvider, sessionOwner, salt, BigInt(expiry)]
  );

  const result = keccak256(packedData);
  return result;
};

/**
 * Generates the final session hash by combining the session request hash with a challenge number.
 * Uses ABI encoding to ensure compatibility with the Dart implementation.
 *
 * @param {string} params.sessionRequestHash - The hash generated from generateSessionRequestHash
 * @param {number} params.challenge - The challenge number to combine with the session request hash
 * @returns {string} A bytes32 hash of the encoded session parameters and challenge
 */
export const generateSessionHash = ({
  sessionRequestHash,
  challenge,
}: {
  sessionRequestHash: string;
  challenge: number | string;
}): string => {
  // Use ABI encoding to match the Dart implementation
  const abiCoder = new AbiCoder();
  const packedData = abiCoder.encode(
    ["bytes32", "uint256"],
    [sessionRequestHash, BigInt(challenge)]
  );

  return keccak256(packedData);
};

/**
 * Verifies a session request by validating the signature against the session owner's address.
 * This function combines the session salt generation and request hash generation to verify
 * that the signature was created by the session owner.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig
 * @param {string} params.sessionOwner - The address of the session owner to verify against
 * @param {string} params.source - The source identifier used in generating the session salt
 * @param {string} params.type - The type identifier used in generating the session salt
 * @param {number} params.expiry - UTC timestamp in seconds when the session expires
 * @param {string} params.signature - The signature to verify, created by the session owner
 * @returns {boolean} True if the signature is valid and matches the session owner's address
 */
export const verifySessionRequest = ({
  community,
  sessionOwner,
  source,
  type,
  expiry,
  signature,
}: {
  community: CommunityConfig;
  sessionOwner: string;
  source: string;
  type: string;
  expiry: number;
  signature: string;
}): boolean => {
  const salt = generateSessionSalt({ source, type });

  const sessionRequestHash = generateSessionRequestHash({
    community,
    sessionOwner,
    salt,
    expiry,
  });

  const recoveredAddress = verifyMessage(
    getBytes(sessionRequestHash),
    signature
  );

  return recoveredAddress === sessionOwner;
};

/**
 * Verifies a session confirmation by validating the signed session hash against the session owner's address.
 * This function checks if the signature of the session hash was created by the session owner.
 *
 * @param {string} params.sessionOwner - The address of the session owner to verify against
 * @param {string} params.sessionHash - The session hash generated from generateSessionHash
 * @param {string} params.signedSessionHash - The signature of the session hash to verify
 * @returns {boolean} True if the signature is valid and matches the session owner's address
 */
export const verifySessionConfirm = ({
  sessionOwner,
  sessionHash,
  signedSessionHash,
}: {
  sessionOwner: string;
  sessionHash: string;
  signedSessionHash: string;
}): boolean => {
  const recoveredAddress = verifyMessage(
    getBytes(sessionHash),
    signedSessionHash
  );

  return recoveredAddress === sessionOwner;
};

/**
 * Submits a session request to the session manager contract through a bundler service.
 * This function encodes the session parameters and sends a transaction to create a new session.
 * The challenge expiry is automatically set to 120 seconds from the current time.
 *
 * @param {CommunityConfig} params.community - An instance of CommunityConfig
 * @param {Wallet} params.signer - The wallet instance used to sign the transaction
 * @param {string} params.sessionSalt - The unique salt generated for this session
 * @param {string} params.sessionRequestHash - The hash of the session request parameters
 * @param {string} params.signedSessionRequestHash - The signature of the session request hash
 * @param {string} params.signedSessionHash - The signature of the session hash
 * @param {number} params.sessionExpiry - UTC timestamp in seconds when the session expires
 * @returns {Promise<string>} The transaction hash of the session request
 */
export const requestSession = async ({
  community,
  signer,
  sessionSalt,
  sessionRequestHash,
  signedSessionRequestHash,
  signedSessionHash,
  sessionExpiry,
}: {
  community: CommunityConfig;
  signer: Wallet;
  sessionSalt: string;
  sessionRequestHash: string;
  signedSessionRequestHash: string;
  signedSessionHash: string;
  sessionExpiry: number;
}): Promise<string> => {
  const sessionModuleAddress = community.primarySessionConfig.module_address;
  const sessionProvider = community.primarySessionConfig.provider_address;

  const bundler = new BundlerService(community);

  const challengeExpiry = Math.floor(Date.now() / 1000) + 120;

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData("request", [
      sessionSalt,
      sessionRequestHash,
      signedSessionRequestHash,
      signedSessionHash,
      sessionExpiry,
      challengeExpiry,
    ])
  );

  const tx = await bundler.call(
    signer,
    sessionModuleAddress,
    sessionProvider,
    data
  );

  return tx;
};

/**
 * Verifies an incoming session request by checking its validity against the session manager contract.
 * Performs multiple validations:
 * 1. Checks if the session request exists in the contract
 * 2. Validates that the session has not expired
 * 3. Validates that the challenge period has not expired
 * 4. Verifies the signature matches the stored signature
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig
 * @param {Wallet} params.signer - The wallet instance used to sign and verify the session
 * @param {string} params.sessionRequestHash - The hash of the session request to verify
 * @param {string} params.sessionHash - The session hash to sign and compare
 * @returns {Promise<boolean>} True if the session request is valid and signatures match, false otherwise
 * @throws {Error} If session request is not found, expired, or challenge period has ended
 */
export const verifyIncomingSessionRequest = async ({
  community,
  signer,
  sessionRequestHash,
  sessionHash,
  options,
}: {
  community: CommunityConfig;
  signer: Wallet;
  sessionRequestHash: string;
  sessionHash: string;
  options?: { accountFactoryAddress?: string };
}): Promise<boolean> => {
  const { accountFactoryAddress } = options ?? {};

  try {
    // Get the session manager contract address
    const sessionModuleAddress = community.primarySessionConfig.module_address;
    const sessionProvider = community.primarySessionConfig.provider_address;

    const rpcProvider = new JsonRpcProvider(
      community.getRPCUrl(accountFactoryAddress)
    );

    const contract = new Contract(
      sessionModuleAddress,
      sessionManagerInterface,
      rpcProvider
    );

    const result = await contract.sessionRequests(
      sessionProvider,
      sessionRequestHash
    );
    if (result.length < 5) {
      throw new Error("Session request not found");
    }

    // check the expiry
    const expiry = Number(result[0]);
    const now = Math.floor(Date.now() / 1000);
    if (expiry < now) {
      throw new Error("Session request expired");
    }

    // check the challenge expiry
    const challengeExpiry = Number(result[1]);
    if (challengeExpiry < now) {
      throw new Error("Challenge expired");
    }

    // Extract the stored signedSessionHash from the result
    const storedSignedSessionHash = result[2];

    // Sign the provided sessionHash with the signer
    const calculatedSignedSessionHash = await signer.signMessage(
      getBytes(sessionHash)
    );

    // Compare the stored signedSessionHash with the provided one
    return storedSignedSessionHash === calculatedSignedSessionHash;
  } catch (error) {
    console.error("Error verifying incoming session request:", error);
    return false;
  }
};

/**
 * Confirms a session request by submitting the confirmation transaction through a bundler service.
 * This function encodes the session confirmation parameters and sends them to the session manager contract.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig containing contract addresses
 * @param {Wallet} params.signer - The wallet instance used to sign the transaction
 * @param {string} params.sessionRequestHash - The hash of the original session request
 * @param {string} params.sessionHash - The final session hash to confirm
 * @param {string} params.signedSessionHash - The signature of the session hash
 * @returns {Promise<string>} The transaction hash of the confirmation transaction
 */
export const confirmSession = async ({
  community,
  signer,
  sessionRequestHash,
  sessionHash,
  signedSessionHash,
}: {
  community: CommunityConfig;
  signer: Wallet;
  sessionRequestHash: string;
  sessionHash: string;
  signedSessionHash: string;
}): Promise<string> => {
  const sessionModuleAddress = community.primarySessionConfig.module_address;
  const sessionProvider = community.primarySessionConfig.provider_address;

  const bundler = new BundlerService(community);

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData("confirm", [
      sessionRequestHash,
      sessionHash,
      signedSessionHash,
    ])
  );

  const tx = await bundler.call(
    signer,
    sessionModuleAddress,
    sessionProvider,
    data
  );

  return tx;
};

/**
 * Checks if a session between an account and owner has expired by querying the session manager contract.
 * This function makes a direct call to the contract's isExpired method.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig containing contract addresses and RPC URL
 * @param {string} params.account - The account address to check the session for
 * @param {string} params.owner - The owner address to check the session against
 * @returns {Promise<boolean>} True if the session has expired or doesn't exist, false if the session is still valid
 * @throws {Error} Logs error and returns false if the contract call fails
 */
export const isSessionExpired = async ({
  community,
  account,
  owner,
  options,
}: {
  community: CommunityConfig;
  account: string;
  owner: string;
  options?: { accountFactoryAddress?: string };
}): Promise<boolean> => {
  const { accountFactoryAddress } = options ?? {};

  // Get the session manager contract address
  const sessionModuleAddress = community.primarySessionConfig.module_address;

  const rpcProvider = new JsonRpcProvider(
    community.getRPCUrl(accountFactoryAddress)
  );

  const contract = new Contract(
    sessionModuleAddress,
    sessionManagerInterface,
    rpcProvider
  );
  try {
    const result = await contract.isExpired(account, owner);
    return result;
  } catch (error) {
    console.error("Error checking if session is expired:", error);
    return true;
  }
};

/**
 * Retrieves the deterministic address for a 2FA account based on the community configuration, source, and type.
 * This function queries the 2FA factory contract to compute the address that would be created with these parameters.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig containing factory and provider addresses
 * @param {string} params.source - The source identifier used to generate the salt
 * @param {string} params.type - The type identifier used to generate the salt
 * @returns {Promise<string | null>} The computed 2FA address if successful, null if the computation fails
 */
export const getTwoFAAddress = async ({
  community,
  source,
  type,
  options,
}: {
  community: CommunityConfig;
  source: string;
  type: string;
  options?: {
    accountFactoryAddress?: string;
    sessionFactoryAddress?: string;
    sessionProviderAddress?: string;
    rpcUrl?: string;
  };
}): Promise<string | null> => {
  const {
    accountFactoryAddress,
    sessionFactoryAddress,
    sessionProviderAddress,
    rpcUrl,
  } = options ?? {};

  const factoryAddress =
    sessionFactoryAddress ?? community.primarySessionConfig.factory_address;
  const providerAddress =
    sessionProviderAddress ?? community.primarySessionConfig.provider_address;

  const salt = generateSessionSalt({ source, type });
  const saltBigInt = BigInt(salt);

  const resolvedRpcUrl = rpcUrl ?? community.getRPCUrl(accountFactoryAddress);
  const rpcProvider = new JsonRpcProvider(resolvedRpcUrl);

  const contract = new Contract(
    factoryAddress,
    twoFAFactoryInterface,
    rpcProvider
  );

  try {
    const result = await contract.getFunction("getAddress")(
      providerAddress,
      saltBigInt
    );

    return result;
  } catch (error) {
    console.error("Error getting twoFA address:", error);
    return null;
  }
};

/**
 * Revokes an active session between a signer and an account through the session manager contract.
 * This function sends a revocation transaction using the bundler service.
 *
 * @param {CommunityConfig} params.community - Instance of CommunityConfig containing contract addresses
 * @param {Wallet} params.signer - The wallet instance used to sign and revoke the session
 * @param {string} params.account - The account address from which to revoke the session
 * @returns {Promise<string|null>} The transaction hash if successful, null if the revocation fails
 */
export const revokeSession = async ({
  community,
  signer,
  account,
}: {
  community: CommunityConfig;
  signer: Wallet;
  account: string;
}): Promise<string | null> => {
  const sessionModuleAddress = community.primarySessionConfig.module_address;

  const bundler = new BundlerService(community);

  const data = getBytes(
    sessionManagerInterface.encodeFunctionData("revoke", [signer.address])
  );

  try {
    const tx = await bundler.call(signer, sessionModuleAddress, account, data);

    return tx;
  } catch (error) {
    console.error("Error revoking session:", error);
    return null;
  }
};
