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
  walletConnectPairing,
  sendtoUrl,
  calldataUrl,
}

const isWalletConnectURI = (uri: string): boolean => {
  // WalletConnect URI format pattern
  const wcPattern =
    /^wc:[a-f0-9]{64}@\d+\?((?!&)[^&]*&)*relay-protocol=irn(&(?!&)[^&]*)*&symKey=[a-f0-9]{64}(&(?!&)[^&]*)*$/;

  return wcPattern.test(uri);
};

export const parseQRFormat = (raw: string): QRFormat => {
  if (raw.startsWith("ethereum:") && !raw.includes("/")) {
    return QRFormat.eip681;
  } else if (raw.startsWith("ethereum:") && raw.includes("/transfer")) {
    return QRFormat.eip681Transfer;
  } else if (
    (raw.startsWith("http://") || raw.startsWith("https://")) &&
    raw.includes("sendto=")
  ) {
    return QRFormat.sendtoUrl;
  } else if (
    (raw.startsWith("http://") || raw.startsWith("https://")) &&
    raw.includes("calldata=")
  ) {
    return QRFormat.calldataUrl;
  } else if (raw.startsWith("0x")) {
    return QRFormat.address;
  } else if (raw.includes("receiveParams=")) {
    return QRFormat.receiveUrl;
  } else if (raw.includes("voucher=")) {
    return QRFormat.voucher;
  } else if (isWalletConnectURI(raw)) {
    return QRFormat.walletConnectPairing;
  } else {
    return QRFormat.unsupported;
  }
};

/**
 * A tuple type representing parsed QR code data for various formats (address, EIP-681, sendto URL, etc.)
 *
 * @typedef {[string, string | null, string | null]} ParseQRData
 *
 * The tuple contains:
 * - [0] address: The recipient's address or identifier (e.g., Ethereum address, username)
 * - [1] value: The transfer amount or value (can be null if not specified)
 * - [2] description: Additional message or description for the transfer (can be null if not specified)
 */
type ParseQRData = [string, string | null, string | null, string | null];

function parseEIP681(raw: string): ParseQRData {
  const url = new URL(raw);

  let address = url.pathname.split("/")[0];
  if (address.includes("@")) {
    // includes chain id, remove
    address = address.split("@")[0];
  }

  const value = url.searchParams.get("value");

  return [address, value, null, null];
}

function parseEIP681Transfer(raw: string): ParseQRData {
  const url = new URL(raw);

  const address = url.searchParams.get("address");
  const value = url.searchParams.get("uint256");

  return [address || "", value, null, null];
}

function parseReceiveLink(raw: string): ParseQRData {
  const receiveUrl = new URL(raw.replace("#/", ""));

  const encodedParams = receiveUrl.searchParams.get("receiveParams");
  if (encodedParams === null) {
    return ["", null, null, null];
  }

  const decodedParams = decompress(encodedParams);

  const params = new URLSearchParams(decodedParams);

  const address = params.get("address");
  const amount = params.get("amount");

  return [address || "", amount, null, null];
}

function parseSendtoUrl(raw: string): ParseQRData {
  // Replace '/#/' with '/' in the URL
  const cleanRaw = raw.replace("/#/", "/");
  // Decode URL components
  const decodedRaw = decodeURIComponent(cleanRaw);

  // Parse URL and get query parameters
  const receiveUrl = new URL(decodedRaw);
  const params = receiveUrl.searchParams;

  const sendToParam = params.get("sendto");
  const amountParam = params.get("amount");
  const descriptionParam = params.get("description");

  // Return early if no sendto parameter
  if (!sendToParam) {
    return ["", null, null, null];
  }

  // Split sendto parameter into address and alias
  const [address, alias] = sendToParam.split("@");

  // Return parsed data
  return [address, amountParam, descriptionParam, null];
}

function parseCalldataUrl(raw: string): ParseQRData {
  // Replace '/#/' with '/' in the URL
  const cleanRaw = raw.replace("/#/", "/");
  // Decode URL components
  const decodedRaw = decodeURIComponent(cleanRaw);

  // Parse URL and get query parameters
  const receiveUrl = new URL(decodedRaw);
  const params = receiveUrl.searchParams;

  const addressParam = params.get("address");
  const calldataParam = params.get("calldata");
  const valueParam = params.get("value");

  // Return early if no sendto parameter
  if (!calldataParam || !addressParam) {
    return ["", null, null, null];
  }

  // Return parsed data
  return [addressParam, valueParam ?? "0", null, calldataParam];
}

export const parseQRCode = (raw: string): ParseQRData => {
  const format = parseQRFormat(raw);

  switch (format) {
    case QRFormat.address:
      return [raw, null, null, null];
    case QRFormat.eip681:
      return parseEIP681(raw);
    case QRFormat.eip681Transfer:
      return parseEIP681Transfer(raw);
    case QRFormat.receiveUrl:
      return parseReceiveLink(raw);
    case QRFormat.sendtoUrl:
      return parseSendtoUrl(raw);
    case QRFormat.calldataUrl:
      return parseCalldataUrl(raw);
    case QRFormat.voucher:
    // vouchers are invalid for a transfer
    default:
      return ["", null, null, null];
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
