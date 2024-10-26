<div align="center">
    <img src="https://raw.githubusercontent.com/citizenwallet/sdk/main/assets/logo.png" alt="Citizen Wallet Logo" width="200">
    <h1>Citizen Wallet SDK</h1>
</div>

🚧 Alpha

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

# Vouchers

A voucher is actually simply a random private key which is used to generate a Smart Account that we top up and send to someone with some metadata.

You are effectively creating an account, topping it up, describing what it is and sending that over to the other person.

## Create a voucher

```
const communityAlias = 'bread'; // config.community.alias

const voucherName = 'Voucher for X tokens';

const creatorAddress = '0x59D17ec3d96C52d4539eed43f33492679ae4aCf7'; // since the user who is redeeming will only see a transaction from the voucher to them, this allows displaying the original creator on the UI.

const signer = ethers.Wallet.createRandom(); // generate a random account which will be used for the voucher.

const voucher = await createVoucher(
communityAlias,
voucherName,
creatorAddress,
signer
);
```

Example:

```
{
    "voucherLink": "https://app.citizenwallet.xyz/#/?voucher=H4sIAEFF7WYAAw3JyQ3AMAgEwIoiLeYy5YDBJaT-5D3vemZEhHHS83INkWm5G4uo6MJkN4f_jFiEuhZnI3sHyJkaH_18VYRDAAAA&params=H4sIAEFF7WYAAw3LsRLCIAwA0L_p4qIkEDIwSC3_kUI4vdNyR6nn59vlbU_eL9nD2lXKlE9H6-H6s_y4kWYo7GZrClpg1YJQAZCNIxZFmStNknM7tnEWMItjghRNrQ6i95YpMSzI0Zv7SmhIgFOZNvloGLqPy7cd-an9D-Zqgw6DAAAA",
    "voucherAccountAddress": "0x32E6973FB2ff63B88597F93E49B82Ab7427a39Fd"
}
```

## Parse a voucher

```
const parsed = parseVoucher(voucher.voucherLink);
```

Example:

```
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
