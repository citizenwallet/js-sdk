import { hashMessage, Signer } from "ethers";
import { CommunityConfig } from "../config";
import { verifyAccountOwnership } from "../accounts";

export const generateConnectionMessage = (
  accountAddress: string,
  expiryTimeStamp: string,
  redirectUrl: string
): string => {
  const message = `Signature auth for ${accountAddress} with expiry ${expiryTimeStamp} and redirect ${encodeURIComponent(
    redirectUrl
  )}`;

  return hashMessage(message);
};

export const createConnectedUrl = async (
  url: string,
  signer: Signer,
  accountAddress: string,
  expiryTimeStamp: string,
  redirectUrl: string
): Promise<string> => {
  const message = generateConnectionMessage(
    accountAddress,
    expiryTimeStamp,
    redirectUrl
  );
  const signature = await signer.signMessage(message);

  const params = new URLSearchParams({
    sigAuthAccount: accountAddress,
    sigAuthExpiry: expiryTimeStamp,
    sigAuthSignature: signature,
    sigAuthRedirect: redirectUrl,
  });

  return url.includes("?")
    ? `${url}&${params.toString()}`
    : `${url}?${params.toString()}`;
};

export const verifyConnectedUrl = async (
  config: CommunityConfig,
  options: {
    url?: string;
    params?: URLSearchParams;
  }
): Promise<string | null> => {
  if (!options.url && !options.params) {
    throw new Error("Either url or params must be provided");
  }

  const params =
    options.params || new URLSearchParams(options.url?.split("?")[1]);
  const sigAuthAccount = params.get("sigAuthAccount");
  const sigAuthExpiry = params.get("sigAuthExpiry");
  const sigAuthSignature = params.get("sigAuthSignature");
  const sigAuthRedirect = params.get("sigAuthRedirect");

  if (
    !sigAuthAccount ||
    !sigAuthExpiry ||
    !sigAuthSignature ||
    !sigAuthRedirect
  ) {
    const missingParams = [
      !sigAuthAccount && "sigAuthAccount",
      !sigAuthExpiry && "sigAuthExpiry",
      !sigAuthSignature && "sigAuthSignature",
      !sigAuthRedirect && "sigAuthRedirect",
    ].filter(Boolean);

    throw new Error(
      `Invalid connection request: missing ${missingParams.join(", ")}`
    );
  }

  const message = generateConnectionMessage(
    sigAuthAccount,
    sigAuthExpiry,
    sigAuthRedirect
  );

  const verified = await verifyAccountOwnership(
    config,
    sigAuthAccount,
    message,
    sigAuthSignature
  );

  return verified ? sigAuthAccount : null;
};
