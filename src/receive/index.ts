import { CommunityConfig } from "../config";

export const generateReceiveLink = (
  baseUrl: string,
  config: CommunityConfig,
  account: string,
  amount?: string,
  description?: string
): string => {
  const alias = config.community.alias;

  let url = `${baseUrl}/?sendto=${account}@${alias}`;
  if (amount) {
    url += `&amount=${amount}`;
  }

  if (description) {
    url += `&description=${encodeURIComponent(description)}`;
  }

  return url;
};
