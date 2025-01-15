import { CommunityConfig } from "../config";
import { compress } from "../utils/gzip";

export const generateLegacyReceiveLink = (
  baseUrl: string,
  config: CommunityConfig,
  account: string,
  amount?: string,
  description?: string
): string => {
  const alias = config.community.alias;

  let receiveParams = `?address=${account}&alias=${alias}`;
  if (amount) {
    receiveParams += `&amount=${amount}`;
  }

  if (description) {
    receiveParams += `&message=${description}`;
  }

  const compressedParams = compress(receiveParams);

  return `${baseUrl}/#/?alias=${alias}&receiveParams=${compressedParams}`;
};
