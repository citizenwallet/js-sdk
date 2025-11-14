import { gzipSync, gunzipSync } from "fflate";

// Base64 encoding/decoding that works across all runtimes
const base64Encode = (bytes: Uint8Array): string => {
  if (typeof btoa !== "undefined") {
    // Browser or Node.js 18+ with btoa
    return btoa(String.fromCharCode(...bytes));
  }
  // Fallback for environments without btoa (e.g., older Node.js, some edge runtimes)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const a = bytes[i++];
    const b = i < bytes.length ? bytes[i++] : 0;
    const c = i < bytes.length ? bytes[i++] : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result +=
      chars.charAt((bitmap >> 18) & 63) +
      chars.charAt((bitmap >> 12) & 63) +
      (i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : "=") +
      (i - 1 < bytes.length ? chars.charAt(bitmap & 63) : "=");
  }
  return result;
};

const base64Decode = (str: string): Uint8Array => {
  if (typeof atob !== "undefined") {
    // Browser or Node.js 18+ with atob
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  }
  // Fallback for environments without atob
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  str = str.replace(/[^A-Za-z0-9+/=]/g, "");
  const result: number[] = [];
  let i = 0;
  while (i < str.length) {
    const encoded1 = chars.indexOf(str.charAt(i++));
    const encoded2 = chars.indexOf(str.charAt(i++));
    const encoded3 = i < str.length ? chars.indexOf(str.charAt(i++)) : 64;
    const encoded4 = i < str.length ? chars.indexOf(str.charAt(i++)) : 64;
    const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
    result.push((bitmap >> 16) & 255);
    if (encoded3 !== 64) result.push((bitmap >> 8) & 255);
    if (encoded4 !== 64) result.push(bitmap & 255);
  }
  return new Uint8Array(result);
};

export const compress = (data: string): string => {
  const encodedData = new TextEncoder().encode(data);
  const gzippedData = gzipSync(encodedData, { level: 6 });
  const base64Data = base64Encode(gzippedData)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64Data;
};

export const decompress = (data: string): string => {
  const base64Data = data.replace(/-/g, "+").replace(/_/g, "/");
  const gzippedData = base64Decode(base64Data);
  const decompressedData = new TextDecoder().decode(gunzipSync(gzippedData));
  return decompressedData;
};
