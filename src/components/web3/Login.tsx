import { Dispatch, useEffect, useState } from "react";
import { web3Login } from "./api";
import { bodyText } from "./styles";

interface Props {
  web3address?: string;
  onAddressSelected: Dispatch<string>;
}
export const Login: React.FC<Props> = ({ web3address, onAddressSelected }) => {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!web3address) {
      setNotice("Requesting wallet access...");
      web3Login()
        .then((address) => {
          onAddressSelected(address);
          setNotice("");
        })
        .catch((err) => {
          console.error("!!! web3 window.ethereum.request", err);
          setNotice("Failed to connect to wallet");
        });
    }
  }, [web3address, onAddressSelected]);

  return (
    <>
      {notice && <div css={bodyText}>{notice}</div>}

      {web3address && (
        <>
          <div css={[bodyText]}>Your wallet address:</div>
          <div css={[bodyText]}>
            <strong>{web3address}</strong>
          </div>
        </>
      )}
    </>
  );
};
