import dotenv from "dotenv";
dotenv.config();

export interface ConfigCommunityTheme {
  primary: string;
}

export interface ConfigCommunityProfile {
  address: string;
  chain_id: number;
}

export interface ConfigContractLocation {
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
  hidden?: boolean;
  theme?: ConfigCommunityTheme;
  profile: ConfigCommunityProfile;
  primary_token: ConfigContractLocation;
  primary_account_factory: ConfigContractLocation;
  primary_card_manager?: ConfigContractLocation;
  primary_session_manager?: ConfigContractLocation;
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

export interface ConfigClassicCard {
  chain_id: number;
  address: string;
  type: string;
}

export interface ConfigSafeCard {
  chain_id: number;
  instance_id: string;
  address: string;
  type: string;
}

export interface ConfigSession {
  chain_id: number;
  module_address: string;
  factory_address: string;
  provider_address: string;
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
  cards?: { [key: string]: ConfigClassicCard | ConfigSafeCard };
  sessions?: { [key: string]: ConfigSession };
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

  get primaryRPCUrl(): string {
    const accountConfig = this.primaryAccountConfig;
    return `${this.primaryNetwork.node.url}/v1/rpc/${accountConfig.paymaster_address}`;
  }

  getRPCUrl(accountFactoryAddress?: string): string {
    if (!accountFactoryAddress) {
      return this.primaryRPCUrl;
    }

    const accountConfig =
      this.config.accounts[
        `${this.primaryNetwork.id}:${accountFactoryAddress}`
      ];

    return `${this.primaryNetwork.node.url}/v1/rpc/${accountConfig.paymaster_address}`;
  }

  get primaryAccountConfig(): ConfigAccount {
    return this.config.accounts[
      `${this.primaryNetwork.id}:${this.config.community.primary_account_factory.address}`
    ];
  }

  getAccountConfig(accountFactoryAddress?: string): ConfigAccount {
    if (!accountFactoryAddress) {
      return this.primaryAccountConfig;
    }

    return this.config.accounts[
      `${this.primaryNetwork.id}:${accountFactoryAddress}`
    ];
  }

  get primarySessionConfig(): ConfigSession {
    if (
      !this.config.sessions ||
      !this.config.community.primary_session_manager
    ) {
      throw new Error("No sessions found");
    }

    return this.config.sessions[
      `${this.primaryNetwork.id}:${this.config.community.primary_session_manager.address}`
    ];
  }

  get primaryCardConfig(): ConfigClassicCard | ConfigSafeCard {
    if (!this.config.cards || !this.config.community.primary_card_manager) {
      throw new Error("No cards found");
    }

    return this.config.cards[
      `${this.primaryNetwork.id}:${this.config.community.primary_card_manager.address}`
    ];
  }

  get primaryClassicCardConfig(): ConfigClassicCard {
    if (!this.config.cards || !this.config.community.primary_card_manager) {
      throw new Error("No cards found");
    }

    return this.config.cards[
      `${this.primaryNetwork.id}:${this.config.community.primary_card_manager.address}`
    ];
  }

  get primarySafeCardConfig(): ConfigSafeCard {
    if (!this.config.cards || !this.config.community.primary_card_manager) {
      throw new Error("No cards found");
    }

    return this.config.cards[
      `${this.primaryNetwork.id}:${this.config.community.primary_card_manager.address}`
    ] as ConfigSafeCard;
  }

  communityUrl(baseDomain: string): string {
    const { custom_domain, alias } = this.config.community;
    if (custom_domain && !custom_domain.endsWith(baseDomain)) {
      return `https://${custom_domain}`;
    }

    return `https://${alias}.${baseDomain}`;
  }

  get explorer(): ConfigScan {
    return this.config.scan;
  }

  get community(): ConfigCommunity {
    return this.config.community;
  }

  get tokens(): { [key: string]: ConfigToken } {
    return this.config.tokens;
  }

  get scan(): ConfigScan {
    return this.config.scan;
  }

  get accounts(): { [key: string]: ConfigAccount } {
    return this.config.accounts;
  }

  get sessions(): { [key: string]: ConfigSession } | undefined {
    return this.config.sessions;
  }

  get cards():
    | { [key: string]: ConfigClassicCard | ConfigSafeCard }
    | undefined {
    return this.config.cards;
  }

  get chains(): { [key: string]: ConfigChain } {
    return this.config.chains;
  }

  get ipfs(): ConfigIPFS {
    return this.config.ipfs;
  }

  get plugins(): ConfigPlugin[] | undefined {
    return this.config.plugins;
  }

  get configLocation(): string {
    return this.config.config_location;
  }

  get version(): number {
    return this.config.version;
  }
}
