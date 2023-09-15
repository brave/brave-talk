// this code is derived from the reference implementation at https://eips.ethereum.org/assets/eip-4361/example.js

export interface EIP4361Message {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export const createEIP4361Message = (
  message: EIP4361Message,
  account: string,
): string => {
  let result = `${message.domain} wants you to sign in with your ${account} account:\n${message.address}\n\n`;

  if (message.statement) {
    result = result.concat(message.statement, "\n");
  }
  result = result.concat("\n");
  result = result.concat(`URI: ${message.uri}\n`);
  result = result.concat(`Version: ${message.version}\n`);
  result = result.concat(`Chain ID: ${message.chainId}\n`);
  result = result.concat(`Nonce: ${message.nonce}\n`);
  result = result.concat(`Issued At: ${message.issuedAt}\n`);
  if (message.expirationTime) {
    result = result.concat(`Expiration Time: ${message.expirationTime}\n`);
  }
  if (message.notBefore) {
    result = result.concat(`Not Before: ${message.notBefore}\n`);
  }
  if (message.requestId) {
    result = result.concat(`Request ID: ${message.requestId}\n`);
  }
  if (message.resources) {
    result = result.concat("Resources:\n");
    message.resources.forEach((resource) => {
      result = result.concat(`- ${resource}\n`);
    });
  }

  return result.trim();
};
