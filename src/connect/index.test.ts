import { getBytes, verifyMessage, Wallet } from "ethers";
import { CommunityConfig } from "../config";
import {
  createConnectedUrl,
  generateConnectionMessage,
  verifyConnectedUrl,
} from "./index";
import path from "path";
import { readFileSync } from "fs";

// Create a minimal mock of CommunityConfig for testing
class MockCommunityConfig {
  primaryRPCUrl = "https://mock-rpc.xyz";
  primaryToken = {
    address: "0x1234567890123456789012345678901234567890",
    symbol: "MOCK",
    decimals: 18,
    standard: "ERC20",
    name: "Mock Token",
    chain_id: 1,
  };
  primaryAccountConfig = {
    account_factory_address: "0x1234567890123456789012345678901234567890",
    chain_id: 1,
    entrypoint_address: "0x1234567890123456789012345678901234567890",
    paymaster_address: "0x1234567890123456789012345678901234567890",
    paymaster_type: "none",
  };
}

describe("Connection flow", () => {
  const baseUrl = "https://citizenwallet.xyz";

  const config = readFileSync(
    path.join(__dirname, "../../community.json"),
    "utf8"
  );
  const mockConfig = new CommunityConfig(JSON.parse(config));

  it("should generate a similar message", async () => {
    const account = "0x4250526126491EF53ca4A73e97151b5c2597F43c";
    const expiry = "2025-05-10T10:29:12.092327";
    const expectedMessage =
      "0x35bbfc49dbeb73133a5d7981b06852172d41c2bc196765e82f91be87e526f259";

    const message = generateConnectionMessage(account, expiry);

    expect(message).toBe(expectedMessage);
  });

  it("should recover the signer from the message", async () => {
    const account = "0x4250526126491EF53ca4A73e97151b5c2597F43c";
    const expiry = "2025-05-10T10:42:50.946999";

    const expectedSigner = "0xc7708688514e823b239dc96501456484DC9F1858";

    const expectedMessage =
      "0x7c5d7b588eba2f5d8e2fc1b8873a09b608392615520ce97e355635645a5f123a";
    const expectedSignature =
      "0x1531134566a4728b629d0a8365683274be0491f44a8bf141dcbc326de7f714f903b335e8023855b207518478d55141975a26eac5985f1460c63b5b019bc230e41c";

    const message = generateConnectionMessage(account, expiry);

    expect(message).toBe(expectedMessage);

    const recoveredSigner = verifyMessage(getBytes(message), expectedSignature);

    expect(recoveredSigner).toBe(expectedSigner);
  });

  it("should successfully connect with a valid signer", async () => {
    // Create a random wallet
    const wallet = Wallet.createRandom();
    const accountAddress = wallet.address;

    // Set expiry to 1 hour from now
    const expiryTimeStamp = (Math.floor(Date.now() / 1000) + 3600).toString();
    const redirectUrl = "https://app.example.com";

    // Create connected URL
    const connectedUrl = await createConnectedUrl(
      baseUrl,
      wallet,
      accountAddress,
      expiryTimeStamp,
      redirectUrl
    );

    // Verify the connected URL
    const verifiedAccount = await verifyConnectedUrl(mockConfig, {
      url: connectedUrl,
    });

    expect(verifiedAccount).toBe(accountAddress);
  });

  it("should fail to connect with an invalid signature", async () => {
    // Create two random wallets - one for signing, one for the account address
    const signerWallet = Wallet.createRandom();
    const accountWallet = Wallet.createRandom();

    const expiryTimeStamp = (Math.floor(Date.now() / 1000) + 3600).toString();
    const redirectUrl = "https://app.example.com";

    // Create connected URL with mismatched signer and account
    const connectedUrl = await createConnectedUrl(
      baseUrl,
      signerWallet, // Sign with different wallet
      accountWallet.address, // But use different account address
      expiryTimeStamp,
      redirectUrl
    );

    // Verify should fail
    const verifiedAccount = await verifyConnectedUrl(mockConfig, {
      url: connectedUrl,
    });

    expect(verifiedAccount).toBeNull();
  });
});
