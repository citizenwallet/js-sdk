import { Wallet, SigningKey, JsonRpcProvider, BaseWallet, Contract } from "ethers";
import { compress, decompress } from "../utils/gzip.ts";
import type { CommunityConfig } from "../config/index.ts";
import accountFactoryAbi from "../abi/AccountFactory.abi.json" with { type: "json" };

export interface Voucher {
  alias: string;
  creator: string;
  account: string;
  name: string;
}

/**
 * Parses a voucher from a given data string (typically a URL).
 *
 * @param data - A string containing the voucher data, usually in URL format.
 * @returns An object containing the parsed voucher information and a signer.
 * @throws Error if the voucher data is invalid or incomplete.
 *
 * @remarks
 * This function performs the following steps:
 * 1. Parses the input string as a URL.
 * 2. Extracts and decodes the voucher key (signer's private key).
 * 3. Creates a signer from the decoded key.
 * 4. Extracts and decodes the voucher parameters.
 * 5. Constructs a Voucher object from the decoded parameters.
 * 6. Validates the voucher data for completeness.
 */
export const parseVoucher = (data: string) => {
  const url = new URL(data.replace("#/", ""));

  const voucherKey = url.searchParams.get("voucher");
  if (!voucherKey) {
    throw new Error("Invalid voucher");
  }

  const decodedKey = decompress(voucherKey);

  const signingKey = new SigningKey(
    decodedKey.replace("00", "").replace("v2-", "0x")
  );
  const signer = new Wallet(signingKey);

  const voucherParams = url.searchParams.get("params");
  if (!voucherParams) {
    throw new Error("Invalid voucher");
  }

  const decodedParams = decompress(voucherParams);

  const voucherSearchParams = new URLSearchParams(decodedParams);

  const voucher: Voucher = {
    alias: voucherSearchParams.get("alias") || "",
    creator: voucherSearchParams.get("creator") || "",
    account: voucherSearchParams.get("account") || "",
    name: voucherSearchParams.get("name") || "Voucher",
  };
  if (!voucher.alias || !voucher.creator || !voucher.account) {
    throw new Error("Invalid voucher");
  }

  return { voucher, signer };
};

/**
 * Creates a voucher for a given community.
 *
 * @param communityAlias - The alias of the community for which the voucher is created.
 * @param voucherName - The name of the voucher.
 * @param voucherCreator - The account address of creator. Since the user redeeming the voucher will only see a transaction from the voucher to them, this allows to display the original creator.
 * @param voucherSigner - A newly generated wallet that will be used to sign transactions for this voucher.
 * @returns An object containing the voucher link and the voucher account address.
 *
 * @remarks
 * - A new voucherSigner (wallet) should be generated for each voucher to ensure security.
 * - This function creates a voucher but does not fund it. Tokens need to be sent to the
 *   voucher account address for it to be considered "unredeemed". Without funds, the voucher
 *   will be considered "redeemed" or empty.
 * - The voucherSigner's private key is included in the voucher link, so it's crucial to generate
 *   a new key for each voucher to prevent reuse and potential security issues.
 */
export const createVoucher = async (
  config: CommunityConfig,
  voucherName: string,
  voucherCreator: string,
  voucherSigner: BaseWallet
) => {
  const provider = new JsonRpcProvider(config.primaryNetwork.node.url);

  const accountsConfig = config.primaryAccountConfig;

  const accountFactory = new Contract(
    accountsConfig.account_factory_address,
    accountFactoryAbi,
    provider
  );
  const voucherAccountAddress = await accountFactory.getFunction("getAddress")(voucherSigner.address, BigInt(0));

  const voucherParams = new URLSearchParams();
  voucherParams.set("alias", communityAlias);
  voucherParams.set("creator", voucherCreator);
  voucherParams.set("account", voucherAccountAddress);
  voucherParams.set("name", voucherName);

  const voucherString = compress(voucherParams.toString());

  const voucherKey = `v2-${voucherSigner.privateKey
    .replace("00", "") // there are sometimes 00s in the private key
    .replace("0x", "")}`;

  const encodedVoucherKey = compress(voucherKey);

  const voucherLink = `https://app.citizenwallet.xyz/#/?voucher=${encodedVoucherKey}&params=${voucherString}`;

  return { voucherLink, voucherAccountAddress };
};
