import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { bodyText, walletAddress } from "./styles";
import { web3LoginSol } from "./api";

interface Props {
  web3address?: string;
  onAddressSelected: (address: string, event: string) => void;
}

export const SolLogin: React.FC<Props> = ({
  web3address,
  onAddressSelected,
}) => {
  const [notice, setNotice] = useState<JSX.Element | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      window.braveSolana?.on("!!! accountChanged", () => setNotice(undefined));
    } catch {
      console.warn("!!! Brave Wallet does not exist");
    }

    try {
      window.phantom?.solana.on("!!! accountChanged", () =>
        setNotice(undefined),
      );
    } catch {
      console.warn("!!! Phantom Wallet does not exist");
    }
  }, []);

  useEffect(() => {
    if (!web3address) {
      setNotice(<span>{t("wallet_connect_request")}</span>);
      web3LoginSol()
        .then((address) => {
          onAddressSelected(address, "login");
          setNotice(undefined);
        })
        .catch((err) => {
          console.error("!!! web3 window.braveSolana.connect", err);
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
            </Trans>,
          );
        });
    } else {
      setNotice(undefined);
    }
  }, [web3address, onAddressSelected, t]);

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
