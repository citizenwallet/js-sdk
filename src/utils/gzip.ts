import { gzipSync, gunzipSync } from "fflate";

export const compress = (data: string) => {
  const encodedData = new TextEncoder().encode(data);
  const gzippedData = gzipSync(encodedData, { level: 6 });
  const base64Data = btoa(String.fromCharCode(...gzippedData))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64Data;
};

export const decompress = (data: string) => {
  const base64Data = data.replace(/-/g, "+").replace(/_/g, "/");
  const gzippedData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const decompressedData = new TextDecoder().decode(gunzipSync(gzippedData));
  return decompressedData;
};
