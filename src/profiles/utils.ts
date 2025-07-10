/**
 * Converts an Ethereum address to a BigInt
 * @param address The Ethereum address as a string (with or without '0x' prefix)
 * @returns The address as a BigInt
 */
export function addressToId(address: string): bigint {
  const cleanAddress = address.toLowerCase().replace("0x", "");
  return BigInt("0x" + cleanAddress);
}

/**
 * Converts a BigInt back to an Ethereum address
 * @param id The BigInt representation of an Ethereum address
 * @returns The Ethereum address as a string with '0x' prefix
 */
export function idToAddress(id: bigint): string {
  const hexString = id.toString(16);
  // Pad with zeros to ensure 40 characters (20 bytes)
  const paddedHex = hexString.padStart(40, "0");
  return "0x" + paddedHex;
}

/**
 * Limits a string's length to the specified length
 * @param str The input string
 * @param maxLength The maximum length of the string
 * @returns The string truncated to the specified length
 */
export function limitStringLength(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength);
}
