import { hexlify, toUtf8Bytes, JsonRpcProvider, Contract } from "ethers";
import { type CommunityConfig } from "../config";
import { downloadJsonFromIpfs } from "../ipfs";
import profileContractAbi from "../abi/Profile.abi.json";
import dotenv from "dotenv";
import { addressToId, idToAddress } from "./utils";
dotenv.config();

export interface Profile {
  account: string;
  description: string;
  image: string;
  image_medium: string;
  image_small: string;
  name: string;
  username: string;
}

export interface ProfileWithTokenId extends Profile {
  token_id: string;
}

export const formatProfileImageLinks = (
  ipfsUrl: string,
  profile: Profile
): Profile => {
  if (profile.image_small.startsWith("ipfs://")) {
    profile.image_small = `${ipfsUrl}/${profile.image_small.replace(
      "ipfs://",
      ""
    )}`;
  }

  if (profile.image_medium.startsWith("ipfs://")) {
    profile.image_medium = `${ipfsUrl}/${profile.image_medium.replace(
      "ipfs://",
      ""
    )}`;
  }

  if (profile.image.startsWith("ipfs://")) {
    profile.image = `${ipfsUrl}/${profile.image.replace("ipfs://", "")}`;
  }

  return profile;
};

const padBytesWithSpace = (bytes: Uint8Array, length: number): Uint8Array => {
  const spaceByte = new TextEncoder().encode(" ");
  while (bytes.length < length) {
    bytes = new Uint8Array([...spaceByte, ...bytes]);
  }
  return bytes;
};

export const formatUsernameToBytes32 = (username: string): string => {
  return hexlify(padBytesWithSpace(toUtf8Bytes(username.replace("@", "")), 32));
};

export const getProfileFromId = async (
  ipfsDomain: string,
  config: CommunityConfig,
  id: string
): Promise<ProfileWithTokenId | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
    config.community.profile.address,
    profileContractAbi,
    rpc
  );

  try {
    const address = idToAddress(BigInt(id));

    const uri: string = await contract.getFunction("tokenURI")(address);

    const profile = await downloadJsonFromIpfs<Profile>(ipfsDomain, uri);

    return {
      ...formatProfileImageLinks(`https://${ipfsDomain}`, profile),
      token_id: id,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const getProfileFromAddress = async (
  ipfsDomain: string,
  config: CommunityConfig,
  address: string
): Promise<ProfileWithTokenId | null> => {
  const id = addressToId(address);

  return getProfileFromId(ipfsDomain, config, id.toString());
};

export const getProfileFromUsername = async (
  ipfsDomain: string,
  config: CommunityConfig,
  username: string
): Promise<ProfileWithTokenId | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
    config.community.profile.address,
    profileContractAbi,
    rpc
  );

  try {
    const formattedUsername = formatUsernameToBytes32(username);

    const uri: string = await contract.getFunction("getFromUsername")(
      formattedUsername
    );

    const profile = await downloadJsonFromIpfs<Profile>(ipfsDomain, uri);

    const id = addressToId(profile.account);

    return {
      ...formatProfileImageLinks(`https://${ipfsDomain}`, profile),
      token_id: id.toString(),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const checkUsernameAvailability = async (
  config: CommunityConfig,
  username: string
): Promise<boolean> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
    config.community.profile.address,
    profileContractAbi,
    rpc
  );

  try {
    const formattedUsername = formatUsernameToBytes32(username);

    const uri: string | null | undefined = await contract.getFunction(
      "getFromUsername"
    )(formattedUsername);

    return uri === null || uri === undefined || uri === "";
  } catch (error) {
    console.error("Error checking username availability:", error);
    return true;
  }
};
