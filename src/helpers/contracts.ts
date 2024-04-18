import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { abi as ERC20ABI } from "@openzeppelin/contracts/build/contracts/ERC20.json";

export async function getTokenSymbol(tokenAddress: string, provider: JsonRpcProvider): Promise<string> {
  const contractInstance = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  const symbol = await contractInstance.symbol();
  return symbol;
}
