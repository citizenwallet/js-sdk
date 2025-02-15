import { Wallet } from "ethers";
import { CommunityConfig } from "../config";
import { createConnectedUrl, verifyConnectedUrl } from "./index";
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
