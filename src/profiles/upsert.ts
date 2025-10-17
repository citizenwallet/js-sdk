import { Wallet } from "ethers";
import { getCidFromUri } from "../utils/ipfs";
import {
  PinataOptions,
  pinFileToIPFS,
  pinJSONToIPFS,
  unpin,
} from "../internal/pinata/pinata/pinata";
import { CommunityConfig } from "../config";
import {
  formatProfileImageLinks,
  getProfileFromAddress,
  getProfileUriFromId,
  Profile,
} from ".";
import { getAccountAddress } from "../accounts";
import { BundlerService } from "../bundler";

export interface ProfileMetadata {
  username: string;
  name?: string;
  description?: string;
}

/**
 * Profile images
 * @param small - The small image (128x128)
 * @param medium - The medium image (512x512)
 * @param large - The large image (1024x1024)
 *
 * Ideally, you have a good quality image and you would like a medium and small version of it.
 * But if you only provide large, then the small and medium will be the same as the large.
 */
export interface ProfileImages {
  small?: File;
  medium?: File;
  large: File;
}

const IPFS_DOMAIN = "ipfs.internal.citizenwallet.xyz";
const DEFAULT_PROFILE_IMAGE_IPFS_HASH =
  "bafkreigngxh4cwk7nwbnipxwlo6kko4w3fokgkskqz2uhtdtjm73d6ddme";

/**
 * Upsert a profile
 * @param community - The community config
 * @param signer - The signer
 * @param pinataOptions - The pinata options
 * @param account - The account
 * @param metadata - The profile metadata
 * @param images - The profile images
 *
 * Intended for backend use only since it uses pinata options
 */
export const upsertProfile = async (
  community: CommunityConfig,
  signer: Wallet,
  pinataOptions: PinataOptions,
  account: string,
  metadata: ProfileMetadata,
  images?: ProfileImages,
  parent?: string | null
) => {
  const ipfsDomain = IPFS_DOMAIN;

  const existingProfile = await getProfileFromAddress(
    ipfsDomain,
    community,
    account
  );

  const defaultCardProfileImage = DEFAULT_PROFILE_IMAGE_IPFS_HASH;

  const profileManagerAddress = await getAccountAddress(
    community,
    signer.address
  );
  if (!profileManagerAddress) {
    throw new Error("Failed to get profile manager address");
  }

  let image_small = `ipfs://${defaultCardProfileImage}`;
  if (images) {
    const cid = await pinFileToIPFS(
      images?.small ?? images.large,
      pinataOptions
    );

    if (!cid) {
      throw new Error("Failed to pin image to IPFS");
    }

    image_small = `ipfs://${cid}`;
  }

  let image_medium = `ipfs://${defaultCardProfileImage}`;
  if (images) {
    const cid = await pinFileToIPFS(
      images?.medium ?? images.large,
      pinataOptions
    );
    if (!cid) {
      throw new Error("Failed to pin image to IPFS");
    }

    image_medium = `ipfs://${cid}`;
  }

  let image_large = `ipfs://${defaultCardProfileImage}`;
  if (images) {
    const cid = await pinFileToIPFS(images.large, pinataOptions);
    if (!cid) {
      throw new Error("Failed to pin image to IPFS");
    }

    image_large = `ipfs://${cid}`;
  }

  const profile: Profile = {
    username: metadata.username.toLowerCase(),
    name: metadata.name ?? metadata.username,
    account,
    description: metadata.description ?? "",
    image_small,
    image_medium,
    image: image_large,
    parent: parent || undefined,
  };

  const formattedProfile = formatProfileImageLinks(
    `https://${ipfsDomain}`,
    profile
  );

  const response = await pinJSONToIPFS(formattedProfile, pinataOptions);

  if (!response) {
    throw new Error("Failed to pin profile");
  }

  // Unpin the existing profile if it exists
  if (existingProfile) {
    const uri = await getProfileUriFromId(
      community,
      BigInt(existingProfile.token_id)
    );

    if (uri) {
      const response = await unpin(uri, pinataOptions);

      if (!response?.ok) {
        console.error("Failed to unpin profile", response);
      }
    }

    const smallCid = getCidFromUri(existingProfile.image_small);
    const mediumCid = getCidFromUri(existingProfile.image_medium);
    const largeCid = getCidFromUri(existingProfile.image);

    const toUnpin = [];
    if (smallCid !== defaultCardProfileImage) {
      toUnpin.push(smallCid);
    }
    if (mediumCid !== defaultCardProfileImage) {
      toUnpin.push(mediumCid);
    }
    if (largeCid !== defaultCardProfileImage) {
      toUnpin.push(largeCid);
    }

    await Promise.all(toUnpin.map((hash) => unpin(hash, pinataOptions)));
  }

  const bundler = new BundlerService(community);

  await bundler.setProfile(
    signer,
    profileManagerAddress,
    profile.account,
    profile.username,
    response
  );
};

export const deleteProfile = async (
  community: CommunityConfig,
  signer: Wallet,
  pinataOptions: PinataOptions,
  account: string
) => {
  const ipfsDomain = IPFS_DOMAIN;

  const existingProfile = await getProfileFromAddress(
    ipfsDomain,
    community,
    account
  );

  if (!existingProfile) {
    return;
  }

  const defaultCardProfileImage = DEFAULT_PROFILE_IMAGE_IPFS_HASH;

  const profileManagerAddress = await getAccountAddress(
    community,
    signer.address
  );
  if (!profileManagerAddress) {
    throw new Error("Failed to get profile manager address");
  }

  const uri = await getProfileUriFromId(
    community,
    BigInt(existingProfile.token_id)
  );

  if (uri) {
    const response = await unpin(uri, pinataOptions);

    if (!response?.ok) {
      console.error("Failed to unpin profile", response);
    }
  }

  const smallCid = getCidFromUri(existingProfile.image_small);
  const mediumCid = getCidFromUri(existingProfile.image_medium);
  const largeCid = getCidFromUri(existingProfile.image);

  const toUnpin = [];
  if (smallCid !== defaultCardProfileImage) {
    toUnpin.push(smallCid);
  }
  if (mediumCid !== defaultCardProfileImage) {
    toUnpin.push(mediumCid);
  }
  if (largeCid !== defaultCardProfileImage) {
    toUnpin.push(largeCid);
  }

  await Promise.all(toUnpin.map((hash) => unpin(hash, pinataOptions)));

  const bundler = new BundlerService(community);

  await bundler.burnProfile(signer, profileManagerAddress, account);
};
