import { CommunityConfig } from "../config";
import { compress, decompress } from "../utils/gzip";

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

// enum that represents the different qr code formats
export enum QRFormat {
  address,
  voucher,
  eip681,
  eip681Transfer,
  receiveUrl,
  unsupported,
}

export const parseQRFormat = (raw: string): QRFormat => {
  if (raw.startsWith("ethereum:") && !raw.includes("/")) {
    return QRFormat.eip681;
  } else if (raw.startsWith("ethereum:") && raw.includes("/transfer")) {
    return QRFormat.eip681Transfer;
  } else if (raw.startsWith("0x")) {
    return QRFormat.address;
  } else if (raw.includes("receiveParams=")) {
    return QRFormat.receiveUrl;
  } else if (raw.includes("voucher=")) {
    return QRFormat.voucher;
  } else {
    return QRFormat.unsupported;
  }
};

function parseEIP681(raw: string): [string, string | null] {
  const url = new URL(raw);

  let address = url.pathname.split("/")[1];
  if (address.includes("@")) {
    // includes chain id, remove
    address = address.split("@")[0];
  }

  const value = url.searchParams.get("value");

  return [address, value];
}

function parseEIP681Transfer(raw: string): [string, string | null] {
  const url = new URL(raw);

  const address = url.searchParams.get("address");
  const value = url.searchParams.get("uint256");

  return [address || "", value];
}

function parseReceiveLink(raw: string): [string, string | null] {
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return ["", null];
  }

  const decodedParams = decompress(encodedParams);

  const params = new URLSearchParams(decodedParams);

  const address = params.get("address");
  const amount = params.get("amount");

  return [address || "", amount];
}

export const parseQRCode = (raw: string): [string, string | null] => {
  const format = parseQRFormat(raw);

  switch (format) {
    case QRFormat.address:
      return [raw, null];
    case QRFormat.eip681:
      return parseEIP681(raw);
    case QRFormat.eip681Transfer:
      return parseEIP681Transfer(raw);
    case QRFormat.receiveUrl:
      return parseReceiveLink(raw);
    case QRFormat.voucher:
    // vouchers are invalid for a transfer
    default:
      return ["", null];
  }
};

export const parseAliasFromReceiveLink = (raw: string): string | null => {
  console.log('raw.replace("#/", "")', raw.replace("#/", ""));
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return null;
  }

  const decodedParams = decompress(encodedParams);

  const params = new URLSearchParams(decodedParams);

  const alias = params.get("alias");

  return alias;
};

export const parseMessageFromReceiveLink = (raw: string): string | null => {
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return null;
  }

  const decodedParams = decompress(encodedParams);

  const params = new URLSearchParams(decodedParams);

  const message = params.get("message");

  return message;
};