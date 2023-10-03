import { Contract, BrowserProvider, parseUnits } from "ethers";

const ERC20Abi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

const tokenContractAddresses = {
  BAT: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
};

export type AllowedERC20Tokens = keyof typeof tokenContractAddresses;

export const sendCrypto = async (
  amount: string,
  token: AllowedERC20Tokens,
  toAddress: string,
) => {
  const prov = new BrowserProvider(window.ethereum);
  const signer = await prov.getSigner();

  const cx = new Contract(tokenContractAddresses[token], ERC20Abi, signer);

  const parsedAmount = parseUnits(amount, 18);
  const tx = await cx.transfer(toAddress, parsedAmount);

  // here tx is a promise that resolves once the transaction is mined
  return tx;
};
