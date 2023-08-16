import { splitAddresses } from "./api";

it("Should validate the space-seprated allow/exception addresses syntax", () => {
  const addresses =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const expected = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ];
  const actual = splitAddresses(addresses);

  expect(actual).toEqual(expected);
});

it("Should validate the comma-seprated allow/exception addresses syntax", () => {
  const addresses =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const expected = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ];
  const actual = splitAddresses(addresses);

  expect(actual).toEqual(expected);
});

it("Should validate the new-line-seprated allow/exception addresses syntax", () => {
  const addresses =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const expected = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ];
  const actual = splitAddresses(addresses);

  expect(actual).toEqual(expected);
});
