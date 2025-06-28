<div align="center">
    <img src="https://raw.githubusercontent.com/citizenwallet/sdk/main/assets/logo.png" alt="Citizen Wallet Logo" width="200">
    <h1>Citizen Wallet SDK</h1>
</div>

An easy-to-use SDK for building frontend interfaces that interact with a community server and any related smart contracts that we use. This SDK is frontend framework agnostic and includes types, API calls, and state management.

# Introduction

Welcome to the official SDK for our platform.

We hope you find this SDK useful, and we're excited to see what you build with it!

# Installation

To install the SDK, run the following command in your terminal:

```
Deno add jsr:@citizenwallet/sdk
```

# Installation (npm)

To install the SDK, run the following command in your terminal:

```
npm install --save @citizenwallet/sdk
```

# API Reference

## Configuration

### Types and Interfaces

- `Config` - Main configuration interface
- `ConfigCommunity` - Community configuration
- `ConfigToken` - Token configuration
- `ConfigAccount` - Account configuration
- `ConfigChain` - Chain configuration
- `ConfigIPFS` - IPFS configuration
- `ConfigPlugin` - Plugin configuration

### CommunityConfig Class

The main configuration class that provides helper methods for accessing community settings.

```typescript
import { CommunityConfig } from "@citizenwallet/sdk";

const config = new CommunityConfig(configData);

// Access primary token
const token = config.primaryToken;

// Access primary network
const network = config.primaryNetwork;

// Access RPC URL
const rpcUrl = config.primaryRPCUrl;

// Access account configuration
const accountConfig = config.primaryAccountConfig;

// Access session configuration
const sessionConfig = config.primarySessionConfig;

// Access card configuration
const cardConfig = config.primaryCardConfig;
```

## Constants

### Networks

Predefined network configurations for supported blockchains:

```typescript
import { NETWORKS } from "@citizenwallet/sdk";

// Available networks: 100 (Gnosis), 137 (Polygon), 8453 (Base), 42220 (CELO), 42161 (Arbitrum)
const gnosisNetwork = NETWORKS["100"];
```

## Profiles

Profile management functions for community members.

### `formatProfileImageLinks(ipfsUrl: string, profile: Profile): Profile`

Formats profile image URLs to use the provided IPFS domain.

### `formatUsernameToBytes32(username: string): string`

Converts a username to bytes32 format for smart contract interaction.

### `getProfileFromId(ipfsDomain: string, config: CommunityConfig, id: string): Promise<ProfileWithTokenId | null>`

Retrieves a profile by its token ID.

### `getProfileFromAddress(ipfsDomain: string, config: CommunityConfig, address: string): Promise<ProfileWithTokenId | null>`

Retrieves a profile by wallet address.

### `getProfileFromUsername(ipfsDomain: string, config: CommunityConfig, username: string): Promise<ProfileWithTokenId | null>`

Retrieves a profile by username.

### `hasProfileAdminRole(config: CommunityConfig, address: string): Promise<boolean>`

Checks if an address has profile admin role.

### `checkUsernameAvailability(config: CommunityConfig, username: string): Promise<boolean>`

Checks if a username is available for registration.

## Logs

Transaction log management and querying.

### `LogsService` Class

Service for querying transaction logs with pagination and filtering.

```typescript
import { LogsService } from "@citizenwallet/sdk";

const logsService = new LogsService(config);

// Get a specific log
const log = await logsService.getLog(tokenAddress, hash);

// Get logs with pagination and filtering
const logs = await logsService.getLogs(tokenAddress, topic, {
  limit: 10,
  offset: 0,
  maxDate: "2024-01-01T00:00:00Z",
  data: { key: "value" },
});

// Get all logs
const allLogs = await logsService.getAllLogs(tokenAddress, topic);

// Get new logs since a date
const newLogs = await logsService.getNewLogs(tokenAddress, topic, {
  fromDate: "2024-01-01T00:00:00Z",
});
```

### Event Signatures

- `TRANSFER_EVENT_SIGNATURE` - ERC20 transfer event signature

## Bundler

Smart account transaction bundling and execution.

### `BundlerService` Class

Service for creating and submitting user operations to the bundler.

```typescript
import { BundlerService } from "@citizenwallet/sdk";

const bundler = new BundlerService(config);

// Send ERC20 tokens
const txHash = await bundler.sendERC20Token(
  signer,
  tokenAddress,
  fromAddress,
  toAddress,
  amount,
  description
);

// Mint ERC20 tokens
const txHash = await bundler.mintERC20Token(
  signer,
  tokenAddress,
  fromAddress,
  toAddress,
  amount,
  description
);

// Burn ERC20 tokens
const txHash = await bundler.burnFromERC20Token(
  signer,
  tokenAddress,
  senderAddress,
  fromAddress,
  amount,
  description
);

// Set profile
const txHash = await bundler.setProfile(
  signer,
  signerAccountAddress,
  profileAccountAddress,
  username,
  ipfsHash
);

// Burn profile
const txHash = await bundler.burnProfile(
  signer,
  signerAccountAddress,
  profileAccountAddress
);

// Grant role
const txHash = await bundler.grantRole(
  signer,
  tokenAddress,
  senderAddress,
  role,
  accountAddress
);

// Revoke role
const txHash = await bundler.revokeRole(
  signer,
  tokenAddress,
  senderAddress,
  role,
  accountAddress
);

// Execute custom call
const txHash = await bundler.call(
  signer,
  contractAddress,
  senderAddress,
  calldata,
  value,
  userOpData,
  extraData
);
```

## IPFS

IPFS integration utilities.

### `downloadJsonFromIpfs<T>(ipfsDomain: string, uri: string): Promise<T>`

Downloads and parses JSON data from IPFS.

## Vouchers

Voucher creation and parsing for token distribution.

### `createVoucher(config: CommunityConfig, voucherName: string, voucherCreator: string, voucherSigner: BaseWallet): Promise<{voucherLink: string, voucherAccountAddress: string}>`

Creates a voucher for token distribution.

### `parseVoucher(data: string): {voucher: Voucher, signer: BaseWallet}`

Parses a voucher from a URL or data string.

## Deep Links

QR code parsing and deep link generation.

### `generateLegacyReceiveLink(baseUrl: string, config: CommunityConfig, account: string, amount?: string, description?: string): string`

Generates a legacy receive link for token transfers.

### `parseQRFormat(raw: string): QRFormat`

Determines the format of a QR code or URI.

### `parseQRCode(raw: string): ParseQRData`

Parses QR code data into structured format.

### `parseMessageFromReceiveLink(raw: string): string | null`

Extracts message from a receive link.

## Accounts

Account management and verification functions.

### `getENSAddress(mainnetRpcUrl: string, domain: string): Promise<string | null>`

Resolves ENS domain to address.

### `getAccountAddress(config: CommunityConfig, address: string, salt?: bigint): Promise<string | null>`

Gets the smart account address for a given owner and salt.

### `getAccountBalance(config: CommunityConfig, address: string): Promise<bigint | null>`

Gets the token balance for an account.

### `verifyAccountOwnership(config: CommunityConfig, accountAddress: string, message: string, signature: string): Promise<boolean>`

Verifies account ownership through signature validation.

### `isSafeOwner(config: CommunityConfig, accountAddress: string, ownerAddress: string): Promise<boolean>`

Checks if an address is an owner of a Safe account.

## Receive

Receive link generation.

### `generateReceiveLink(baseUrl: string, config: CommunityConfig, account: string, amount?: string, description?: string): string`

Generates a receive link for token transfers.

## Transactions

Transaction utilities.

### `waitForTxSuccess(config: CommunityConfig, txHash: string, timeout?: number): Promise<boolean>`

Waits for a transaction to be confirmed and checks its success status.

## Cards

Card management functions.

### `getCardAddress(config: CommunityConfig, hashedSerial: string, instanceId?: string): Promise<string | null>`

Gets the card address for a given serial number and instance.

### `instanceOwner(config: CommunityConfig, instanceId?: string): Promise<string | null>`

Gets the owner of a card instance.

## Calldata

Smart contract call data generation.

### `tokenTransferCallData(to: string, value: bigint): Uint8Array`

Generates calldata for ERC20 token transfers.

### `tokenMintCallData(to: string, value: bigint): Uint8Array`

Generates calldata for ERC20 token minting.

### `createInstanceCallData(config: CommunityConfig, contracts: string[], instanceId?: string): Uint8Array`

Generates calldata for creating card instances.

### `updateInstanceContractsCallData(config: CommunityConfig, contracts: string[], instanceId?: string): Uint8Array`

Generates calldata for updating instance contracts.

### `updateWhitelistCallData(config: CommunityConfig, addresses: string[], instanceId?: string): Uint8Array`

Generates calldata for updating whitelist.

### `callOnCardCallData(config: CommunityConfig, hashedSerial: string, to: string, value: bigint, data: Uint8Array, instanceId?: string): Uint8Array`

Generates calldata for executing calls on cards.

### `addOwnerCallData(config: CommunityConfig, hashedSerial: string, newOwner: string, instanceId?: string): Uint8Array`

Generates calldata for adding card owners.

### `generateCalldataLink(baseUrl: string, config: CommunityConfig, address: string, value: bigint, calldata: string): string`

Generates a deep link with calldata for execution.

### Event Topics

- `tokenTransferEventTopic` - ERC20 transfer event topic
- `tokenTransferSingleEventTopic` - ERC1155 transfer single event topic
- `roleGrantedEventTopic` - Role granted event topic
- `roleRevokedEventTopic` - Role revoked event topic

## Utils

### Crypto

Cryptographic utilities and role management.

### `isFunctionInABI(func: string, abi: any[]): boolean`

Checks if a function exists in an ABI.

### `hasRole(tokenAddress: string, role: string, account: string, provider: JsonRpcProvider): Promise<boolean>`

Checks if an account has a specific role.

### Role Constants

- `MINTER_ROLE` - ERC20 minter role hash
- `PROFILE_ADMIN_ROLE` - Profile admin role hash

### Gzip

Compression utilities for voucher and deep link data.

- `compress(data: string): string` - Compresses data using gzip
- `decompress(data: string): string` - Decompresses gzipped data

## Alias

Domain parsing utilities.

### `parseAliasFromDomain(domain: string, basePath: string): string`

Extracts community alias from a domain.

## Connect

Authentication and connection utilities.

### `generateConnectionMessage(accountAddress: string, expiryTimeStamp: string, redirectUrl?: string): string`

Generates a connection message for signature authentication.

### `generateConnectedHeaders(signer: Signer, accountAddress: string, expiryTimeStamp: string, redirectUrl?: string): Promise<object>`

Generates authentication headers for API requests.

### `createConnectedUrl(url: string, signer: Signer, accountAddress: string, expiryTimeStamp: string, redirectUrl?: string): Promise<string>`

Creates a URL with authentication parameters.

### `verifyConnectedHeaders(config: CommunityConfig, headers: Headers): Promise<string | null>`

Verifies authentication headers and returns the account address.

### `verifyConnectedUrl(config: CommunityConfig, options: {url?: string, params?: URLSearchParams}): Promise<string | null>`

Verifies authentication parameters from a URL and returns the account address.

## Session

Session management for secure interactions.

### `generateSessionSalt(params: {source: string, type: string}): string`

Generates a unique salt for session identification.

### `generateSessionRequestHash(params: {community: CommunityConfig, sessionOwner: string, salt: string, expiry: number}): string`

Generates a hash for session request verification.

### `generateSessionHash(params: {sessionRequestHash: string, challenge: number | string}): string`

Generates the final session hash with challenge.

### `verifySessionRequest(params: {community: CommunityConfig, sessionOwner: string, source: string, type: string, expiry: number, signature: string}): boolean`

Verifies a session request signature.

### `verifySessionConfirm(params: {sessionOwner: string, sessionHash: string, signedSessionHash: string}): boolean`

Verifies a session confirmation signature.

### `requestSession(params: {community: CommunityConfig, signer: Wallet, sessionSalt: string, sessionRequestHash: string, signedSessionRequestHash: string, signedSessionHash: string, sessionExpiry: number}): Promise<string>`

Submits a session request to the blockchain.

### `verifyIncomingSessionRequest(params: {community: CommunityConfig, signer: Wallet, sessionRequestHash: string, sessionHash: string}): Promise<boolean>`

Verifies an incoming session request.

### `confirmSession(params: {community: CommunityConfig, signer: Wallet, sessionRequestHash: string, sessionHash: string, signedSessionHash: string}): Promise<string>`

Confirms a session on the blockchain.

### `isSessionExpired(params: {community: CommunityConfig, account: string, owner: string}): Promise<boolean>`

Checks if a session has expired.

### `getTwoFAAddress(params: {community: CommunityConfig, source: string, type: string}): Promise<string | null>`

Gets the 2FA address for a session.

### `revokeSession(params: {community: CommunityConfig, signer: Wallet, account: string}): Promise<string | null>`

Revokes an active session.

## Token

Token metadata utilities.

### `getTokenDecimals(config: CommunityConfig): Promise<bigint | null>`

Gets the decimal places of the primary token.

### `getTokenName(config: CommunityConfig): Promise<string | null>`

Gets the name of the primary token.

### `getTokenSymbol(config: CommunityConfig): Promise<string | null>`

Gets the symbol of the primary token.

### `getTokenMetadata(config: CommunityConfig): Promise<{decimals: bigint | null, name: string | null, symbol: string | null} | null>`

Gets all metadata for the primary token.

# Vouchers

A voucher is actually simply a random private key which is used to generate a Smart Account that we top up and send to someone with some metadata.

You are effectively creating an account, topping it up, describing what it is and sending that over to the other person.

## Create a voucher

```typescript
import { createVoucher } from "@citizenwallet/sdk";

const communityAlias = "bread"; // config.community.alias
const voucherName = "Voucher for X tokens";
const creatorAddress = "0x59D17ec3d96C52d4539eed43f33492679ae4aCf7"; // since the user who is redeeming will only see a transaction from the voucher to them, this allows displaying the original creator on the UI.
const signer = ethers.Wallet.createRandom(); // generate a random account which will be used for the voucher.

const voucher = await createVoucher(
  config,
  voucherName,
  creatorAddress,
  signer
);
```

Example:

```json
{
  "voucherLink": "https://app.citizenwallet.xyz/#/?voucher=H4sIAEFF7WYAAw3JyQ3AMAgEwIoiLeYy5YDBJaT-5D3vemZEhHHS83INkWm5G4uo6MJkN4f_jFiEuhZnI3sHyJkaH_18VYRDAAAA&params=H4sIAEFF7WYAAw3LsRLCIAwA0L_p4qIkEDIwSC3_kUI4vdNyR6nn59vlbU_eL9nD2lXKlE9H6-H6s_y4kWYo7GZrClpg1YJQAZCNIxZFmStNknM7tnEWMItjghRNrQ6i95YpMSzI0Zv7SmhIgFOZNvloGLqPy7cd-an9D-Zqgw6DAAAA",
  "voucherAccountAddress": "0x32E6973FB2ff63B88597F93E49B82Ab7427a39Fd"
}
```

## Parse a voucher

```typescript
import { parseVoucher } from "@citizenwallet/sdk";

const parsed = parseVoucher(voucher.voucherLink);
```

Example:

```json
{
  "voucher": {
    "alias": "bread",
    "creator": "0x59D17ec3d96C52d4539eed43f33492679ae4aCf7",
    "account": "0x32E6973FB2ff63B88597F93E49B82Ab7427a39Fd",
    "name": "test voucher"
  },
  "signer": {
    "provider": null,
    "address": "0x60fab84316061E5c7C2eD09a2c4Be454B6B1fC69"
  }
}
```

signer = type ethers.Wallet

# Config

Every community and their currency has a configuration in a json format.

The SDK provides types for accessing properties as well as a class with helper functions.

# Building (npm)

To build the SDK, run the following command in your terminal:

```
npm run build
```

This will compile the TypeScript code to JavaScript.

# Watching for Changes (npm)

To automatically recompile the SDK when a file changes, run the following command in your terminal:

```
npm run watch
```

# Contributing

We welcome contributions! Please see our contributing guidelines for more details.

# License

This project is licensed under the MIT license.
