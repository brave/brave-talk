import { AllowedERC20Tokens } from "./send-crypto";

export interface CryptoTransactionParams {
  senderDisplayName: string;
  sender: string;
  recipient: string;
  recipientDisplayName: string;
  amount: string;
  token: AllowedERC20Tokens;
  nonce: string;
}

export interface SIWEReturnParams {
  proof: {
    signer: string;
    signature: string;
    payload: string;
  };
  method: string;
}

export interface TransactionPendingResolution {
  senderDisplayName: string;
  jitsiId: string;
  siwe: SIWEReturnParams;
}

export interface CryptoSendMessage {
  type: "crypto";
  msgType: "REQ" | "REJECT" | "SIGNED";
  payload: SIWEReturnParams | CryptoTransactionParams | string;
}

export const isValidEthAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
