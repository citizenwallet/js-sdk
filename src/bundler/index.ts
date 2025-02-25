import { type JsonRpcProvider, ethers } from "ethers";
import tokenEntryPointContractAbi from "../abi/TokenEntryPoint.abi.json";
import accountFactoryContractAbi from "../abi/AccountFactory.abi.json";
import safeAccountFactoryContractAbi from "../abi/SafeAccountFactory.abi.json";
import accountContractAbi from "../abi/Account.abi.json";
import safeContractAbi from "../abi/Safe.abi.json";
import tokenContractAbi from "../abi/ERC20.abi.json";
import profileContractAbi from "../abi/Profile.abi.json";
import { formatUsernameToBytes32 } from "../profiles";
import { MINTER_ROLE, hasRole } from "../utils/crypto";
import type { CommunityConfig } from "../config";
import { tokenTransferEventTopic } from "../calldata";

const accountFactoryInterface = new ethers.Interface(accountFactoryContractAbi);
const safeAccountFactoryInterface = new ethers.Interface(
  safeAccountFactoryContractAbi
);
const accountInterface = new ethers.Interface(accountContractAbi);
const safeInterface = new ethers.Interface(safeContractAbi);
const erc20Token = new ethers.Interface(tokenContractAbi);
const profileInterface = new ethers.Interface(profileContractAbi);

export interface UserOpData {
  [key: string]: string;
}

export interface UserOpExtraData {
  description: string;
}

export interface UserOp {
  sender: string;
  nonce: bigint;
  initCode: Uint8Array;
  callData: Uint8Array;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Uint8Array;
  signature: Uint8Array;
}

interface JsonUserOp {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

const executeCallData = (
  contractAddress: string,
  value: bigint,
  calldata: Uint8Array
): Uint8Array =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      contractAddress,
      value,
      calldata,
    ])
  );

const executeSafeCallData = (
  contractAddress: string,
  value: bigint,
  calldata: Uint8Array
): Uint8Array =>
  ethers.getBytes(
    safeInterface.encodeFunctionData("execTransactionFromModule", [
      contractAddress,
      value,
      calldata,
      BigInt(0),
    ])
  );

const transferCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("transfer", [receiver, amount]),
    ])
  );

const safeTransferCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    safeInterface.encodeFunctionData("execTransactionFromModule", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("transfer", [receiver, amount]),
      BigInt(0),
    ])
  );

const mintCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("mint", [receiver, amount]),
    ])
  );

const safeMintCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    safeInterface.encodeFunctionData("execTransactionFromModule", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("mint", [receiver, amount]),
      BigInt(0),
    ])
  );

const burnFromCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("burnFrom", [receiver, amount]),
    ])
  );

const safeBurnFromCallData = (
  tokenAddress: string,
  value: bigint,
  receiver: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    safeInterface.encodeFunctionData("execTransactionFromModule", [
      tokenAddress,
      value,
      erc20Token.encodeFunctionData("burnFrom", [receiver, amount]),
      BigInt(0),
    ])
  );

const profileCallData = (
  profileContractAddress: string,
  profileAccountAddress: string,
  username: string,
  ipfsHash: string
): Uint8Array => {
  return ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      profileContractAddress,
      BigInt(0),
      profileInterface.encodeFunctionData("set", [
        profileAccountAddress,
        formatUsernameToBytes32(username),
        ipfsHash,
      ]),
    ])
  );
};

const approveCallData = (
  tokenAddress: string,
  issuer: string,
  amount: bigint
): Uint8Array =>
  ethers.getBytes(
    accountInterface.encodeFunctionData("execute", [
      tokenAddress,
      BigInt(0),
      erc20Token.encodeFunctionData("approve", [issuer, amount]),
    ])
  );

const getEmptyUserOp = (sender: string): UserOp => ({
  sender,
  nonce: BigInt(0),
  initCode: ethers.getBytes("0x"),
  callData: ethers.getBytes("0x"),
  callGasLimit: BigInt(0),
  verificationGasLimit: BigInt(0),
  preVerificationGas: BigInt(0),
  maxFeePerGas: BigInt(0),
  maxPriorityFeePerGas: BigInt(0),
  paymasterAndData: ethers.getBytes("0x"),
  signature: ethers.getBytes("0x"),
});

const userOpToJson = (userop: UserOp): JsonUserOp => {
  const newUserop: JsonUserOp = {
    sender: userop.sender,
    nonce: ethers.toBeHex(userop.nonce.toString()).replace("0x0", "0x"),
    initCode: ethers.hexlify(userop.initCode),
    callData: ethers.hexlify(userop.callData),
    callGasLimit: ethers
      .toBeHex(userop.callGasLimit.toString())
      .replace("0x0", "0x"),
    verificationGasLimit: ethers
      .toBeHex(userop.verificationGasLimit.toString())
      .replace("0x0", "0x"),
    preVerificationGas: ethers
      .toBeHex(userop.preVerificationGas.toString())
      .replace("0x0", "0x"),
    maxFeePerGas: ethers
      .toBeHex(userop.maxFeePerGas.toString())
      .replace("0x0", "0x"),
    maxPriorityFeePerGas: ethers
      .toBeHex(userop.maxPriorityFeePerGas.toString())
      .replace("0x0", "0x"),
    paymasterAndData: ethers.hexlify(userop.paymasterAndData),
    signature: ethers.hexlify(userop.signature),
  };

  return newUserop;
};

const userOpFromJson = (userop: JsonUserOp): UserOp => {
  const newUserop: UserOp = {
    sender: userop.sender,
    nonce: BigInt(userop.nonce),
    initCode: ethers.getBytes(userop.initCode),
    callData: ethers.getBytes(userop.callData),
    callGasLimit: BigInt(userop.callGasLimit),
    verificationGasLimit: BigInt(userop.verificationGasLimit),
    preVerificationGas: BigInt(userop.preVerificationGas),
    maxFeePerGas: BigInt(userop.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(userop.maxPriorityFeePerGas),
    paymasterAndData: ethers.getBytes(userop.paymasterAndData),
    signature: ethers.getBytes(userop.signature),
  };

  return newUserop;
};

export interface BundlerOptions {}

export class BundlerService {
  private provider: JsonRpcProvider;
  private accountType: "cw" | "cw-safe";
  private options: BundlerOptions = {};

  constructor(private config: CommunityConfig, options?: BundlerOptions) {
    this.config = config;

    const rpcUrl = this.config.primaryRPCUrl;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    this.accountType = this.config.primaryAccountConfig.paymaster_type as
      | "cw"
      | "cw-safe";

    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  async senderAccountExists(sender: string): Promise<boolean> {
    const url = `${this.config.primaryNetwork.node.url}/v1/accounts/${sender}/exists`;

    const resp = await fetch(url);
    return resp.status === 200;
  }

  private generateUserOp(
    signerAddress: string,
    sender: string,
    senderAccountExists = false,
    accountFactoryAddress: string,
    callData: Uint8Array
  ): UserOp {
    const userop = getEmptyUserOp(sender);

    // initCode
    if (!senderAccountExists) {
      const accountCreationCode =
        this.accountType === "cw-safe"
          ? safeAccountFactoryInterface.encodeFunctionData("createAccount", [
              signerAddress,
              BigInt(0),
            ])
          : accountFactoryInterface.encodeFunctionData("createAccount", [
              signerAddress,
              BigInt(0),
            ]);

      userop.initCode = ethers.getBytes(
        ethers.concat([accountFactoryAddress, accountCreationCode])
      );
    }

    // callData
    userop.callData = callData;

    return userop;
  }

  private async prepareUserOp(
    owner: string,
    sender: string,
    callData: Uint8Array
  ): Promise<UserOp> {
    const accountsConfig = this.config.primaryAccountConfig;

    const accountFactoryAddress = accountsConfig.account_factory_address;

    // check that the sender's account exists
    const exists = await this.senderAccountExists(sender);

    // generate a userop
    const userop = this.generateUserOp(
      owner,
      sender,
      exists,
      accountFactoryAddress,
      callData
    );

    return userop;
  }

  private async paymasterSignUserOp(userop: UserOp): Promise<UserOp> {
    const method = "pm_ooSponsorUserOperation";

    const accountsConfig = this.config.primaryAccountConfig;

    const params = [
      userOpToJson(userop),
      accountsConfig.entrypoint_address,
      { type: accountsConfig.paymaster_type },
      1,
    ];

    const response = await this.provider.send(method, params);

    if (!response?.length) {
      throw new Error("Invalid response");
    }

    return userOpFromJson(response[0]);
  }

  private async signUserOp(
    signer: ethers.Signer,
    userop: UserOp
  ): Promise<Uint8Array> {
    const accountsConfig = this.config.primaryAccountConfig;

    const tokenEntryPointContract = new ethers.Contract(
      accountsConfig.entrypoint_address,
      tokenEntryPointContractAbi,
      this.provider
    );

    const userOpHash = ethers.getBytes(
      await tokenEntryPointContract.getUserOpHash(userop)
    );

    const signature = ethers.getBytes(await signer.signMessage(userOpHash));

    return signature;
  }

  private async submitUserOp(
    userop: UserOp,
    data?: UserOpData,
    extraData?: UserOpExtraData
  ) {
    const method = "eth_sendUserOperation";

    const primaryAccountConfig = this.config.primaryAccountConfig;

    const params: (string | JsonUserOp | UserOpData | UserOpExtraData)[] = [
      userOpToJson(userop),
      primaryAccountConfig.entrypoint_address,
    ];

    if (data) {
      params.push(data);
    }

    if (extraData) {
      params.push(extraData);
    }

    const response: string = await this.provider.send(method, params);

    if (!response?.length) {
      throw new Error("Invalid response");
    }

    return response;
  }

  async call(
    signer: ethers.Signer,
    contractAddress: string,
    sender: string,
    data: Uint8Array,
    value?: bigint,
    userOpData?: UserOpData,
    extraData?: UserOpExtraData
  ) {
    const owner = await signer.getAddress();

    const calldata =
      this.accountType === "cw-safe"
        ? executeSafeCallData(contractAddress, value ?? BigInt(0), data)
        : executeCallData(contractAddress, value ?? BigInt(0), data);

    let userop = await this.prepareUserOp(owner, sender, calldata);

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    // submit the user op
    const hash = await this.submitUserOp(userop, userOpData, extraData);

    return hash;
  }

  async sendERC20Token(
    signer: ethers.Signer,
    tokenAddress: string,
    from: string,
    to: string,
    amount: string,
    description?: string
  ): Promise<string> {
    const token = this.config.primaryToken;

    const formattedAmount = ethers.parseUnits(amount, token.decimals);

    const calldata =
      this.accountType === "cw-safe"
        ? safeTransferCallData(tokenAddress, BigInt(0), to, formattedAmount)
        : transferCallData(tokenAddress, BigInt(0), to, formattedAmount);

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(owner, from, calldata);

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    const data: UserOpData = {
      topic: tokenTransferEventTopic,
      from,
      to,
      value: formattedAmount.toString(),
    };

    // submit the user op
    const hash = await this.submitUserOp(
      userop,
      data,
      description !== undefined ? { description } : undefined
    );

    return hash;
  }

  async mintERC20Token(
    signer: ethers.Signer,
    tokenAddress: string,
    from: string,
    to: string,
    amount: string,
    description?: string
  ): Promise<string> {
    const token = this.config.primaryToken;

    const formattedAmount = ethers.parseUnits(amount, token.decimals);

    const calldata =
      this.accountType === "cw-safe"
        ? safeMintCallData(tokenAddress, BigInt(0), to, formattedAmount)
        : mintCallData(tokenAddress, BigInt(0), to, formattedAmount);

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(owner, from, calldata);

    try {
      // get the paymaster to sign the userop
      userop = await this.paymasterSignUserOp(userop);

      // sign the userop
      const signature = await this.signUserOp(signer, userop);

      userop.signature = signature;
    } catch (e) {
      throw new Error(`Error preparing user op: ${e}`);
    }

    try {
      const data: UserOpData = {
        topic: tokenTransferEventTopic,
        from: ethers.ZeroAddress,
        to,
        value: formattedAmount.toString(),
      };

      // submit the user op
      const hash = await this.submitUserOp(
        userop,
        data,
        description !== undefined ? { description } : undefined
      );

      return hash;
    } catch (e) {
      if (!(await hasRole(tokenAddress, MINTER_ROLE, from, this.provider))) {
        throw new Error(
          `Signer (${from}) does not have the MINTER_ROLE on token contract ${tokenAddress}`
        );
      }
      throw new Error(`Error submitting user op: ${e}`);
    }
  }

  async burnFromERC20Token(
    signer: ethers.Signer,
    tokenAddress: string,
    sender: string,
    from: string,
    amount: string,
    description?: string
  ): Promise<string> {
    const token = this.config.primaryToken;

    const formattedAmount = ethers.parseUnits(amount, token.decimals);

    const calldata =
      this.accountType === "cw-safe"
        ? safeBurnFromCallData(tokenAddress, BigInt(0), from, formattedAmount)
        : burnFromCallData(tokenAddress, BigInt(0), from, formattedAmount);

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(owner, sender, calldata);

    try {
      // get the paymaster to sign the userop
      userop = await this.paymasterSignUserOp(userop);

      // sign the userop
      const signature = await this.signUserOp(signer, userop);

      userop.signature = signature;
    } catch (e) {
      throw new Error(`Error preparing user op: ${e}`);
    }

    try {
      const data: UserOpData = {
        topic: tokenTransferEventTopic,
        from,
        to: ethers.ZeroAddress,
        value: formattedAmount.toString(),
      };

      // submit the user op
      const hash = await this.submitUserOp(
        userop,
        data,
        description !== undefined ? { description } : undefined
      );

      return hash;
    } catch (e) {
      if (!(await hasRole(tokenAddress, MINTER_ROLE, from, this.provider))) {
        throw new Error(
          `Signer (${from}) does not have the MINTER_ROLE on token contract ${tokenAddress}`
        );
      }
      throw new Error(`Error submitting user op: ${e}`);
    }
  }

  async setProfile(
    signer: ethers.Signer,
    signerAccountAddress: string,
    profileAccountAddress: string,
    username: string,
    ipfsHash: string
  ): Promise<string> {
    const profile = this.config.community.profile;

    const calldata = profileCallData(
      profile.address,
      profileAccountAddress,
      username,
      ipfsHash
    );

    const owner = await signer.getAddress();

    let userop = await this.prepareUserOp(
      owner,
      signerAccountAddress,
      calldata
    );

    // get the paymaster to sign the userop
    userop = await this.paymasterSignUserOp(userop);

    // sign the userop
    const signature = await this.signUserOp(signer, userop);

    userop.signature = signature;

    // submit the user op
    const hash = await this.submitUserOp(userop);

    return hash;
  }

  async awaitSuccess(txHash: string): Promise<ethers.TransactionReceipt> {
    const receipt = await this.provider.waitForTransaction(txHash, 1, 12000);
    if (!receipt) {
      throw new Error("Transaction failed");
    }

    if (receipt.status !== 1) {
      throw new Error("Transaction failed");
    }

    return receipt;
  }
}
