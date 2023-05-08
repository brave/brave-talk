import { Dispatch, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { web3Login } from "./api";
import { bodyText, walletAddress } from "./styles";

interface Props {
  web3address?: string;
  onAddressSelected: Dispatch<string>;
}

export const Login: React.FC<Props> = ({ web3address, onAddressSelected }) => {
  const [notice, setNotice] = useState<JSX.Element | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    window.ethereum?.on("accountsChanged", () => setNotice(undefined));
  }, []);

  useEffect(() => {
    if (!web3address) {
      setNotice(<span>{t("wallet_connect_request")}</span>);
      web3Login()
        .then((address) => {
          onAddressSelected(address);
          setNotice(undefined);
        })
        .catch((err) => {
          console.error("!!! web3 window.ethereum.request", err);
          setNotice(
            <Trans i18nKey="wallet_connect_failed">
              <div>
                <p>
                  Failed to connect to wallet. Please reload the page and try
                  again.
                </p>
                <a
                  href="https://support.brave.com/hc/en-us/articles/4415497656461-Brave-Wallet-FAQ"
                  style={{ color: "inherit" }}
                >
                  Help with Brave Wallet
                </a>
              </div>
            </Trans>
          );
        });
    }
  }, [web3address, onAddressSelected]);

  return (
    <>
      {notice && <div css={bodyText}>{notice}</div>}

      {web3address && (
        <>
          <div css={[bodyText]}>{t("wallet_address")}</div>
          <div css={[bodyText, walletAddress]}>
            <strong>{web3address}</strong>
          </div>
        </>
      )}
    </>
  );
};
