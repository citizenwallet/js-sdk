export interface Profile {
  account: string;
  description: string;
  image: string;
  image_medium: string;
  image_small: string;
  name: string;
  username: string;
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
