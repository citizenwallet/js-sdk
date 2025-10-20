export const downloadJsonFromIpfs = async <T>(
  ipfsDomain: string,
  uri: string
): Promise<T> => {
  let url = uri;
  if (!url.startsWith("http")) {
    url = `https://${ipfsDomain}/${url}`;
  }

  const response = await fetch(url);
  const json = await response.json();

  return json;
};
