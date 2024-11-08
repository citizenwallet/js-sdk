import { getEnv } from "../utils/env";

export const downloadJsonFromIpfs = async <T>(uri: string): Promise<T> => {
  let url = uri;
  if (!url.startsWith("http")) {
    const baseUrl = getEnv("IPFS_DOMAIN");
    if (!baseUrl) {
      throw new Error("IPFS_DOMAIN is not set");
    }

    url = `https://${baseUrl}/${url}`;
  }

  const response = await fetch(url);
  const json = await response.json();

  return json;
};
