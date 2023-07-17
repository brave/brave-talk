import { createEIP4361Message } from "./EIP4361";

it("Should create an EIP4361 message in the correct format", () => {
  const now = new Date().toISOString();
  const requestId = "1";
  const expected = `talk.brave.com wants you to sign in with your Ethereum account:
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

I accept the ServiceOrg Terms of Service: https://service.invalid/tos

URI: https://talk.brave.com
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: ${now}
Expiration Time: ${now}
Not Before: ${now}
Request ID: ${requestId}
Resources:
- ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/
- https://example.com/my-web2-claim.json`;

  const message = {
    domain: "talk.brave.com",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    statement:
      "I accept the ServiceOrg Terms of Service: https://service.invalid/tos",
    uri: "https://talk.brave.com",
    version: "1",
    chainId: 1,
    nonce: "32891756",
    issuedAt: now,
    expirationTime: now,
    notBefore: now,
    requestId: requestId,
    resources: [
      "ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/",
      "https://example.com/my-web2-claim.json",
    ],
  };
  const actual = createEIP4361Message(message);

  expect(actual).toEqual(expected);
});
