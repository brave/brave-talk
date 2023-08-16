import React, { ReactNode, useState, Dispatch } from "react";
import { bodyText } from "./styles";
import { splitAddresses } from "./api";

interface Props {
  header: string;
  subhead: string;
  web3Address: string;
  web3Account: "ETH" | "SOL" | null;
  isExceptionAddressWrong?: boolean;
  setIsExceptionAddressWrong?: (val: boolean) => void;
  children?: ReactNode;
  exceptionList: string[];
  compareList: string[];
  onChange: Dispatch<string[]>;
}

export const ExceptionListPanel: React.FC<Props> = ({
  header,
  subhead,
  web3Account,
  web3Address,
  isExceptionAddressWrong,
  setIsExceptionAddressWrong,
  exceptionList,
  compareList,
  onChange,
}) => {
  const [inputText, setInputText] = useState("");
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [validAddresses, setValidAddresses] = useState<string[]>([]);

  const placeholderText =
    web3Account === "ETH"
      ? "0x0000000000000000000000000000000000000000, ..."
      : "5GNhXCcQ9uxU5xUN2h3Adi4BK2YGXL7fWZ8Zf8voM1qo, ...";

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const validateAddresses = () => {
    const addresses = splitAddresses(inputText);
    const invalidAddressesList = addresses.filter((address) => {
      return (
        address &&
        (!isValidAddress(address, web3Account) ||
          compareList.includes(address) ||
          address === web3Address)
      );
    });

    const validAddressesList = addresses.filter((address) => {
      return (
        address &&
        isValidAddress(address, web3Account) &&
        !compareList.includes(address) &&
        address !== web3Address
      );
    });
    if (invalidAddressesList.length !== 0) {
      setIsExceptionAddressWrong?.(true);
    } else {
      setIsExceptionAddressWrong?.(false);
    }
    setInvalidAddresses(invalidAddressesList);
    setValidAddresses(validAddressesList);
    onChange(validAddressesList);
  };

  const isValidAddress = (
    address: string,
    accountType: "ETH" | "SOL" | null
  ): boolean => {
    if (accountType === "ETH") {
      // hexadecimal Ethereum address.
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (accountType === "SOL") {
      // Base58 character set
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } else {
      return false; // Invalid accountType
    }
  };

  return (
    <div>
      <div
        css={{
          background: "rgba(255, 255, 255, 0.24)",
          backdropFilter: "blur(8px)",
          marginTop: "11px",
          padding: "24px 19px",
          textAlign: "left",
        }}
      >
        <div
          css={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div css={{ flex: 1 }}>
            <div
              css={{
                fontWeight: 500,
                fontSize: "22px",
                lineHeight: "32px",
              }}
            >
              {header}
            </div>
            <div>{subhead}</div>
          </div>
        </div>
        <textarea
          css={{
            fontWeight: 200,
            fontSize: "15px",
            lineHeight: "15px",
            width: "100%",
            height: "auto", // Adjust height based on content
            resize: "vertical", // Allow vertical resizing if needed
            marginTop: "3px",
            borderColor: invalidAddresses.length > 0 ? "red" : undefined, // Add red border if there are invalid addresses
          }}
          placeholder={placeholderText}
          value={inputText}
          onChange={handleInputChange}
          onBlur={validateAddresses}
          rows={3} // Set the number of visible rows here (adjust as needed)
        />
      </div>
      {invalidAddresses.length > 0 && (
        <div css={[bodyText, { marginTop: "28px" }]}>
          {invalidAddresses.length === 1
            ? "Invalid address:"
            : "Invalid addresses:"}
          {invalidAddresses.map((address, index) => (
            <div key={index}>{address}</div>
          ))}
        </div>
      )}
    </div>
  );
};
