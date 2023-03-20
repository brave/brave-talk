// this code is derived from the reference implementation at https://eips.ethereum.org/assets/eip-4361/example.js

// can't use import since there aren't any declaration files
/* eslint-disable */
const apgApi = require("buffer-apg-js/src/apg-api/api");
const apgLib = require("buffer-apg-js/src/apg-lib/node-exports");
/* eslint-enable */

const GRAMMAR = `
sign-in-with-ethereum =
    domain %s" wants you to sign in with your Ethereum account:" LF
    address LF
    LF
    [ statement LF ]
    LF
    %s"URI: " URI LF
    %s"Version: " version LF
    %s"Chain ID: " chain-id LF
    %s"Nonce: " nonce LF
    %s"Issued At: " issued-at
    [ LF %s"Expiration Time: " expiration-time ]
    [ LF %s"Not Before: " not-before ]
    [ LF %s"Request ID: " request-id ]
    [ LF %s"Resources:"
    resources ]

domain = authority

address = "0x" 40*40HEXDIG
    ; Must also conform to captilization
    ; checksum encoding specified in EIP-55
    ; where applicable (EOAs).

statement = 1*( reserved / unreserved / " " )
    ; The purpose is to exclude LF (line breaks).

version = "1"

nonce = 8*( ALPHA / DIGIT )

issued-at = date-time
expiration-time = date-time
not-before = date-time

request-id = *pchar

chain-id = 1*DIGIT
    ; See EIP-155 for valid CHAIN_IDs.

resources = *( LF resource )

resource = "- " URI

; ------------------------------------------------------------------------------
; RFC 3986

URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

hier-part     = "//" authority path-abempty
              / path-absolute
              / path-rootless
              / path-empty

scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

authority     = [ userinfo "@" ] host [ ":" port ]
userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
host          = IP-literal / IPv4address / reg-name
port          = *DIGIT

IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

IPv6address   =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

h16           = 1*4HEXDIG
ls32          = ( h16 ":" h16 ) / IPv4address
IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
dec-octet     = DIGIT                 ; 0-9
                 / %x31-39 DIGIT         ; 10-99
                 / "1" 2DIGIT            ; 100-199
                 / "2" %x30-34 DIGIT     ; 200-249
                 / "25" %x30-35          ; 250-255

reg-name      = *( unreserved / pct-encoded / sub-delims )

path-abempty  = *( "/" segment )
path-absolute = "/" [ segment-nz *( "/" segment ) ]
path-rootless = segment-nz *( "/" segment )
path-empty    = 0pchar

segment       = *pchar
segment-nz    = 1*pchar

pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

query         = *( pchar / "/" / "?" )

fragment      = *( pchar / "/" / "?" )

pct-encoded   = "%" HEXDIG HEXDIG

unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
reserved      = gen-delims / sub-delims
gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
              / "*" / "+" / "," / ";" / "="

; ------------------------------------------------------------------------------
; RFC 3339

date-fullyear   = 4DIGIT
date-month      = 2DIGIT  ; 01-12
date-mday       = 2DIGIT  ; 01-28, 01-29, 01-30, 01-31 based on
                          ; month/year
time-hour       = 2DIGIT  ; 00-23
time-minute     = 2DIGIT  ; 00-59
time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
                          ; rules
time-secfrac    = "." 1*DIGIT
time-numoffset  = ("+" / "-") time-hour ":" time-minute
time-offset     = "Z" / time-numoffset

partial-time    = time-hour ":" time-minute ":" time-second
                  [time-secfrac]
full-date       = date-fullyear "-" date-month "-" date-mday
full-time       = partial-time time-offset

date-time       = full-date "T" full-time

; ------------------------------------------------------------------------------
; RFC 5234

ALPHA          =  %x41-5A / %x61-7A   ; A-Z / a-z
LF             =  %x0A
                  ; linefeed
DIGIT          =  %x30-39
                  ; 0-9
HEXDIG         =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
`;

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
  const api = new apgApi(GRAMMAR);
  api.generate();

  const grammarObj = api.toObject();
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

  const result = parser.parse(grammarObj, "sign-in-with-ethereum", message);
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
    result = result.concat(`Expiration Time: ${message.requestId}\n`);
  }
  if (message.resources) {
    result = result.concat("Resources:");
    message.resources.forEach((resource) => {
      result = result.concat(`- ${resource}\n`);
    });
  }

  return result.trim();
};
