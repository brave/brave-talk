import React, { ReactNode, useState, Dispatch } from "react";

interface Props {
  header: string;
  subhead: string;
  web3Account: "ETH" | "SOL" | null;
  isExceptionAddressWrong?: boolean;
  setIsExceptionAddressWrong?: (val: boolean) => void;
  children?: ReactNode;
  exceptionList: string[];
  onChange: Dispatch<string[]>;
}

export const ExceptionListPanel: React.FC<Props> = ({
  header,
  subhead,
  web3Account,
  isExceptionAddressWrong,
  setIsExceptionAddressWrong,
  exceptionList,
  onChange,
}) => {
  const [inputText, setInputText] = useState("");
  const [invalidAddresses, setInvalidAddresses] = useState<string[]>([]);
  const [validAddresses, setValidAddresses] = useState<string[]>([]);

  const placeholderText =
    web3Account === "ETH"
      ? "0x8d247168113b8aa0f020b2441e98b613b9878qmc, ..."
      : "BtsXBPrf69qEWQrrxVENGvZY2tqFUgZB9zbrpa4t4Rfo, ...";

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const validateAddresses = () => {
    const delimitersRegex = /,|\s|\t|\n/; // Regex to match comma, space, tab, or newline
    const addresses = inputText
      .split(delimitersRegex)
      .map((address) => address.trim());
    const invalidAddressesList: string[] = [];
    const validAddressesList: string[] = [];
    let flag = 0;
    addresses.forEach((address) => {
      if (!address) {
        // Skip empty addresses (remove empty strings from the list)
        return;
      }
      if (!isValidAddress(address, web3Account)) {
        flag = 1;
        invalidAddressesList.push(address);
      } else {
        validAddressesList.push(address);
      }
    });
    if (flag === 1) {
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
      return /^[1-9A-HJ-NP-Za-km-z]{44}$/.test(address);
    } else {
      return false; // Invalid accountType
    }
  };

  return (
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
      {invalidAddresses.length > 0 && (
        <div
          css={{
            color: "red",
            fontSize: "12px",
            marginBottom: "8px",
          }}
        >
          Invalid address(es): {invalidAddresses.join(", ")}
        </div>
      )}
      {/* <input
        type="text"
        css={{
          fontWeight: 200,
          fontSize: '15px',
          lineHeight: '15px',
          width: '100%',
          marginTop: '3px',
          borderColor: invalidAddresses.length > 0 ? 'red' : undefined, // Add red border if there are invalid addresses
        }}
        placeholder={placeholderText}
        value={inputText}
        onChange={handleInputChange}
        onBlur={validateAddresses}
      /> */}
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
  );
};
