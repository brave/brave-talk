// this code is derived from the reference implementation at https://eips.ethereum.org/assets/eip-4361/example.js

// can't use import since there aren't any declaration files
/* eslint-disable */
global.Buffer = require("buffer/").Buffer;

const apgLib = require("apg-js/src/apg-lib/node-exports");
const grammar = new (require("./eip4361-grammar.js"))();
/* eslint-enable */

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

export const parseEIP4361Message = (message: string): any => {
  const parser = new apgLib.parser();
  parser.ast = new apgLib.ast();
  const id = apgLib.ids;

  const charToString = apgLib.utils.charsToString;

  const getField = (field: string) =>
    function (
      state: any,
      chars: any,
      phraseIndex: number,
      phraseLength: number,
      data: any
    ) {
      const ret = id.SEM_OK;
      if (state === id.SEM_PRE) {
        data[field] = charToString(chars, phraseIndex, phraseLength);
      }
      return ret;
    };

  const domain = getField("domain");
  parser.ast.callbacks.domain = domain;
  const address = getField("address");
  parser.ast.callbacks.address = address;
  const statement = getField("statement");
  parser.ast.callbacks.statement = statement;
  const uri = getField("uri");
  parser.ast.callbacks.uri = uri;
  const version = getField("version");
  parser.ast.callbacks.version = version;
  const chainId = getField("chainId");
  parser.ast.callbacks["chain-id"] = chainId;
  const nonce = getField("nonce");
  parser.ast.callbacks.nonce = nonce;
  const issuedAt = getField("issuedAt");
  parser.ast.callbacks["issued-at"] = issuedAt;
  const expirationTime = getField("expirationTime");
  parser.ast.callbacks["expiration-time"] = expirationTime;
  const notBefore = getField("notBefore");
  parser.ast.callbacks["not-before"] = notBefore;
  const requestId = getField("requestId");
  parser.ast.callbacks["request-id"] = requestId;

  const resources = function (
    state: any,
    chars: any,
    phraseIndex: number,
    phraseLength: number,
    data: any
  ) {
    const ret = id.SEM_OK;
    if (state === id.SEM_PRE) {
      data.resources = apgLib.utils
        .charsToString(chars, phraseIndex, phraseLength)
        .slice(3)
        .split("\n- ");
    }
    return ret;
  };
  parser.ast.callbacks.resources = resources;

  const result = parser.parse(grammar, "sign-in-with-ethereum", message);
  if (!result.success) {
    throw new Error(`Invalid message: ${JSON.stringify(result)}`);
  }
  const elements: any = {};
  parser.ast.translate(elements);

  // there is probably a cleaner way in TypeScript to do this assignment, but of the five different ways, this is simplest...
  const obj: EIP4361Message = {
    domain: elements.domain,
    address: elements.address,
    statement: elements.statement,
    uri: elements.uri,
    version: elements.version,
    chainId: elements.chainId,
    nonce: elements.nonce,
    issuedAt: elements.issuedAt,
    expirationTime: elements.expirationTime,
    notBefore: elements.notBefore,
    requestId: elements.requestId,
    resources: elements.resources,
  };

  return obj;
};

export const createEIP4361Message = (message: EIP4361Message): string => {
  let result = `${message.domain} wants you to sign in with your Ethereum account:\n${message.address}\n\n`;

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
    result = result.concat("Resources:");
    message.resources.forEach((resource) => {
      result = result.concat(`- ${resource}\n`);
    });
  }

  return result.trim();
};
