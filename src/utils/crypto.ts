import { ethers, JsonRpcProvider } from "ethers";
import accessControlABI from "../abi/IAccessControlUpgradeable.abi.json";

export const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export const PROFILE_ADMIN_ROLE =
  "0x224b562a599bb6f57441f98a50de513dff0de3d9b620f342c27a4e4a898ce8e2";

export function isFunctionInABI(
  func: string,
  abi: (unknown & { type: string; name: string })[]
): boolean {
  return abi.some((item) => item.type === "function" && item.name === func);
}

export async function hasRole(
  tokenAddress: string,
  role: string,
  account: string,
  provider: JsonRpcProvider
): Promise<boolean> {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    accessControlABI,
    provider
  );
  return await tokenContract.getFunction("hasRole")(role, account);
}
