# Citizen Wallet SDK - Usage Guide for AI Code Generation

This guide explains the core concepts of the Citizen Wallet SDK, specifically how to instantiate and use `CommunityConfig`, which is the foundation for all SDK operations.

## Core Concept: CommunityConfig

The `CommunityConfig` class is the central configuration object that must be instantiated and passed to almost all SDK functions. It contains all the information about a community, its tokens, accounts, chains, and other settings.

## How to Instantiate CommunityConfig

### Step 1: Fetch the Configuration JSON

The configuration is typically fetched from a URL (usually from the community's domain) or loaded from a local file:

```typescript
import { CommunityConfig, type Config } from "@citizenwallet/sdk";

// Option 1: Fetch from a URL
async function loadConfigFromUrl(configUrl: string): Promise<CommunityConfig> {
  const response = await fetch(configUrl);
  const configData: Config = await response.json();
  return new CommunityConfig(configData);
}

// Option 2: Load from a local file (in Node.js)
import fs from 'fs';
function loadConfigFromFile(filePath: string): CommunityConfig {
  const configData: Config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return new CommunityConfig(configData);
}
```

### Step 2: Use the CommunityConfig Instance

Once you have a `CommunityConfig` instance, you pass it as the first parameter to most SDK functions:

```typescript
import { 
  CommunityConfig, 
  getAccountAddress, 
  getAccountBalance,
  BundlerService 
} from "@citizenwallet/sdk";

// Initialize config
const config = await loadConfigFromUrl("https://example.com/config/community.json");

// Use config in SDK functions
const accountAddress = await getAccountAddress(config, userAddress);
const balance = await getAccountBalance(config, accountAddress);
const bundler = new BundlerService(config);
```

## Configuration Structure

The `Config` interface (passed to `CommunityConfig` constructor) has the following structure:

```typescript
interface Config {
  community: {
    name: string;
    description: string;
    url: string;
    alias: string;
    custom_domain?: string;
    logo: string;
    hidden?: boolean;
    theme?: { primary: string };
    profile: { address: string; chain_id: number };
    primary_token: { address: string; chain_id: number };
    primary_account_factory: { address: string; chain_id: number };
    primary_card_manager?: { address: string; chain_id: number };
    primary_session_manager?: { address: string; chain_id: number };
  };
  tokens: { [key: string]: ConfigToken };
  scan: { url: string; name: string };
  accounts: { [key: string]: ConfigAccount };
  cards?: { [key: string]: ConfigClassicCard | ConfigSafeCard };
  sessions?: { [key: string]: ConfigSession };
  chains: { [key: string]: ConfigChain };
  ipfs: { url: string };
  plugins?: ConfigPlugin[];
  config_location: string;
  version: number;
}
```

## Common Usage Patterns

### Pattern 1: Account Operations

```typescript
import { CommunityConfig, getAccountAddress, getAccountBalance } from "@citizenwallet/sdk";

const config = new CommunityConfig(configData);

// Get smart account address for a user
const accountAddress = await getAccountAddress(
  config, 
  userWalletAddress,
  BigInt(0) // salt
);

// Get token balance
const balance = await getAccountBalance(config, accountAddress);
```

### Pattern 2: Bundler Service

```typescript
import { CommunityConfig, BundlerService } from "@citizenwallet/sdk";
import { Wallet } from "ethers";

const config = new CommunityConfig(configData);
const bundler = new BundlerService(config);
const signer = new Wallet(privateKey);

// Send tokens
const txHash = await bundler.sendERC20Token(
  signer,
  config.primaryToken.address,
  fromAddress,
  toAddress,
  amount,
  description
);
```

### Pattern 3: Profile Operations

```typescript
import { CommunityConfig, getProfileFromAddress } from "@citizenwallet/sdk";

const config = new CommunityConfig(configData);
const ipfsDomain = config.ipfs.url.replace('https://', '');

const profile = await getProfileFromAddress(
  ipfsDomain,
  config,
  userAddress
);
```

### Pattern 4: Logs Service

```typescript
import { CommunityConfig, LogsService } from "@citizenwallet/sdk";

const config = new CommunityConfig(configData);
const logsService = new LogsService(config);

const logs = await logsService.getLogs(
  config.primaryToken.address,
  topic,
  { limit: 10, offset: 0 }
);
```

## Helper Methods on CommunityConfig

The `CommunityConfig` class provides many helper methods:

```typescript
const config = new CommunityConfig(configData);

// Access primary resources
const primaryToken = config.primaryToken;
const primaryNetwork = config.primaryNetwork;
const primaryRPCUrl = config.primaryRPCUrl;
const primaryAccountConfig = config.primaryAccountConfig;

// Get RPC URL (with optional account factory override)
const rpcUrl = config.getRPCUrl(accountFactoryAddress);

// Get token by address
const token = config.getToken(tokenAddress);

// Get account config
const accountConfig = config.getAccountConfig(accountFactoryAddress);

// Access session config (if available)
const sessionConfig = config.primarySessionConfig;

// Access card config (if available)
const cardConfig = config.primaryCardConfig;
```

## Important Notes

1. **Always pass CommunityConfig as first parameter**: Almost all SDK functions expect `CommunityConfig` as the first parameter.

2. **Config is required**: You cannot use SDK functions without a valid `CommunityConfig` instance. The config must be fetched or loaded before using any SDK functions.

3. **Config structure is validated**: The `CommunityConfig` constructor expects a complete `Config` object matching the interface. Ensure your JSON matches the expected structure.

4. **Config is typically fetched from a URL**: Most communities host their config at a URL like `https://[alias].citizenwallet.xyz/config/community.json` or similar.

5. **Config contains all necessary blockchain info**: The config includes RPC URLs, contract addresses, chain IDs, and other blockchain-specific information needed by the SDK.

## Example: Complete Usage Flow

```typescript
import { 
  CommunityConfig, 
  getAccountAddress,
  getAccountBalance,
  BundlerService,
  getProfileFromAddress
} from "@citizenwallet/sdk";
import { Wallet } from "ethers";

// 1. Load configuration
async function initializeSDK(configUrl: string) {
  const response = await fetch(configUrl);
  const configData = await response.json();
  const config = new CommunityConfig(configData);
  return config;
}

// 2. Use the SDK
async function main() {
  const config = await initializeSDK("https://example.com/config/community.json");
  
  // Get account address
  const userAddress = "0x...";
  const accountAddress = await getAccountAddress(config, userAddress);
  
  // Get balance
  const balance = await getAccountBalance(config, accountAddress);
  
  // Create bundler service
  const bundler = new BundlerService(config);
  
  // Get profile
  const ipfsDomain = config.ipfs.url.replace('https://', '');
  const profile = await getProfileFromAddress(ipfsDomain, config, accountAddress);
  
  return { accountAddress, balance, profile };
}
```

## Summary

- **CommunityConfig** must be instantiated before using any SDK functions
- Config is typically loaded from a JSON URL or file
- Pass `CommunityConfig` as the first parameter to most SDK functions
- The config contains all blockchain and community-specific information
- Use helper methods on `CommunityConfig` to access common resources like `primaryToken`, `primaryNetwork`, etc.

