export const generateReceiveLink = (
  baseUrl: string,
  account: string,
  alias: string,
  amount?: string,
  description?: string
): string => {
  const url = new URL(baseUrl);

  url.searchParams.set("sendto", `${account}@${alias}`);

  if (amount) {
    url.searchParams.set("amount", amount);
  }

  if (description) {
    url.searchParams.set("description", description);
  }

  return url.toString();
};
