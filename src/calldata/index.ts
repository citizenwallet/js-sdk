import { Interface } from "ethers";
import erc20Abi from "../abi/ERC20.abi.json";
import cardManagerModuleAbi from "../abi/CardManagerModule.abi.json";

const erc20Interface = new Interface(erc20Abi);
const cardManagerModuleInterface = new Interface(cardManagerModuleAbi);

export const tokenTransferCallData = (to: string, value: bigint): string => {
  return erc20Interface.encodeFunctionData("transfer", [to, value]);
};
