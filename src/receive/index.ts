import { CommunityConfig } from "../config";

export interface TipOptions {
  destination: string;
  amount: string;
  description?: string;
}

export const generateReceiveLink = (
  baseUrl: string,
  config: CommunityConfig,
  account: string,
  amount?: string,
  description?: string,
  options?: TipOptions
): string => {
  const alias = config.community.alias;

  let url = `${baseUrl}/?alias=${alias}&sendto=${account}@${alias}`;
  if (amount) {
    url += `&amount=${amount}`;
  }

  if (description) {
    url += `&description=${encodeURIComponent(description)}`;
  }

  if (options) {
    url += `&tipTo=${options.destination}&tipAmount=${options.amount}`;
  }

  if (options?.description) {
    url += `&tipDescription=${encodeURIComponent(options.description)}`;
  }

  return url;
};
