import { compress } from "../utils/gzip";

export const generateReceiveLink = (
  baseUrl: string,
  account: string,
  alias: string,
  amount?: string,
  description?: string
): string => {
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
