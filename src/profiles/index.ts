import { hexlify, toUtf8Bytes, JsonRpcProvider, Contract } from "ethers";
import type { CommunityConfig } from "../index.ts";
import { downloadJsonFromIpfs } from "../ipfs/index.ts";
import profileContractAbi from "../abi/Profile.abi.json" with { type: "json" };
import { getEnv } from "../utils/env.ts";

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
  config: CommunityConfig,
  id: string,
): Promise<ProfileWithTokenId | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
      config.community.profile.address,
      profileContractAbi,
      rpc,
  );

  try {
      const address: string = await contract.getFunction("fromIdToAddress")(
          id,
      );

      const uri: string = await contract.getFunction("tokenURI")(address);

      const profile = await downloadJsonFromIpfs<Profile>(uri);

      const baseUrl = getEnv("IPFS_URL");
      if (!baseUrl) {
          throw new Error("IPFS_URL is not set");
      }

      return {
          ...formatProfileImageLinks(baseUrl, profile),
          token_id: id,
      };
  } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
  }
};

export const getProfileFromAddress = async (
  config: CommunityConfig,
  address: string,
): Promise<ProfileWithTokenId | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
      config.community.profile.address,
      profileContractAbi,
      rpc,
  );

  try {
      const id: bigint = await contract.getFunction("fromAddressToId")(
          address,
      );

      return getProfileFromId(config, id.toString());
  } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
  }
};

export const getProfileFromUsername = async (
  config: CommunityConfig,
  username: string,
): Promise<ProfileWithTokenId | null> => {
  const rpc = new JsonRpcProvider(config.primaryRPCUrl);

  const contract = new Contract(
      config.community.profile.address,
      profileContractAbi,
      rpc,
  );

  try {
    const formattedUsername = formatUsernameToBytes32(username);

    const uri: string = await contract.getFunction("getFromUsername")(
      formattedUsername,
    );

      const profile = await downloadJsonFromIpfs<Profile>(uri);

      const id: bigint = await contract.getFunction("fromAddressToId")(
        profile.account,
    );

      const baseUrl = getEnv("IPFS_URL");
      if (!baseUrl) {
          throw new Error("IPFS_URL is not set");
      }

      return {
        ...formatProfileImageLinks(baseUrl, profile),
        token_id: id.toString(),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
      return null;
  }
};
