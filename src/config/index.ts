import { getEnv } from "../utils/env.ts";

export interface ConfigCommunityTheme {
  primary: string;
}

export interface ConfigCommunityProfile {
  address: string;
  chain_id: number;
}

export interface ConfigCommunityToken {
  address: string;
  chain_id: number;
}

export interface ConfigCommunity {
  name: string;
  description: string;
  url: string;
  alias: string;
  custom_domain?: string;
  logo: string;
  theme?: ConfigCommunityTheme;
  profile: ConfigCommunityProfile;
  primary_token: ConfigCommunityToken;
  primary_account_factory: ConfigCommunityToken;
  primary_card_manager: ConfigCommunityToken;
}

export interface ConfigToken {
  standard: string;
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chain_id: number;
}

export interface ConfigScan {
  url: string;
  name: string;
}

export interface ConfigAccount {
  chain_id: number;
  entrypoint_address: string;
  paymaster_address: string;
  account_factory_address: string;
  paymaster_type: string;
}

export interface ConfigCard {
  chain_id: number;
  address: string;
  type: string;
}

export interface ConfigChainNode {
  url: string;
  ws_url: string;
}

export interface ConfigChain {
  id: number;
  node: ConfigChainNode;
}

export interface ConfigIPFS {
  url: string;
}

export interface ConfigPlugin {
  name: string;
  icon: string;
  url: string;
  launch_mode?: string;
}

export interface Config {
  community: ConfigCommunity;
  tokens: { [key: string]: ConfigToken };
  scan: ConfigScan;
  accounts: { [key: string]: ConfigAccount };
  cards?: { [key: string]: ConfigCard };
  chains: { [key: string]: ConfigChain };
  ipfs: ConfigIPFS;
  plugins?: ConfigPlugin[];
  config_location: string;
  version: number;
}

export class CommunityConfig {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  get primaryToken(): ConfigToken {
    return this.config.tokens[
      `${this.config.community.primary_token.chain_id}:${this.config.community.primary_token.address}`
    ];
  }

  get primaryNetwork(): ConfigChain {
    return this.config.chains[`${this.primaryToken.chain_id}`];
  }

  get primaryAccountConfig(): ConfigAccount {
    return this.config.accounts[
      `${this.primaryNetwork.id}:${this.config.community.primary_account_factory.address}`
    ];
  }

  get communityUrl(): string {
    return this.config.community.custom_domain
      ? `https://${this.config.community.custom_domain}`
      : `https://${this.config.community.alias}.${getEnv("BASE_DOMAIN")}`;
  }
}
