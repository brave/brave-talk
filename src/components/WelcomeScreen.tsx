import React, { DispatchWithoutAction } from "react";
import { useSubscribedStatus } from "../hooks/use-subscribed-status";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { DownloadBrave } from "./DownloadBrave";
import { Recordings } from "./Recordings";
import { SectionWithLogo } from "./SectionWithLogo";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { Web3CTA } from "./web3/Web3CTA";
import { StartCall } from "./web3/StartCall";
import { StartCallSol } from "./web3/StartCallSol";
import { JitsiContext } from "../jitsi/types";
import { resolveService } from "../services";
import { Text } from "./Text";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: TranslationKeys;
  disabled: boolean;
  hasInitialRoomName: boolean;
  browser: BrowserProperties;
  isWeb3Call: boolean;
  // isSolAccount: boolean;
  // isEthAccount: boolean;
  web3Account: "ETH" | "SOL" | null;
  jitsiContext: JitsiContext;
  setIsWeb3Call: (isWeb3Call: boolean) => void;
  // setIsSolAccount: (isSolAccount: boolean) => void;
  // setIsEthAccount: (isEthAccount: boolean) => void;
  setWeb3Account: (web3Account: "ETH" | "SOL") => void;
  setJwt: (jwt: string) => void;
  setRoomName: (roomName: string) => void;
  setJitsiContext: (context: JitsiContext) => void;
}

export const WelcomeScreen: React.FC<Props> = ({
  onStartCall,
  notice,
  disabled,
  hasInitialRoomName,
  browser,
  isWeb3Call,
  jitsiContext,
  setIsWeb3Call,
  web3Account,
  setWeb3Account,
  setJwt,
  setRoomName,
  setJitsiContext,
}) => {
  const subscribed = useSubscribedStatus();
  const { t } = useTranslation();
  const onClickWeb3CTA = () => {
    if (process.env.ENVIRONMENT === "local") {
      setIsWeb3Call(true);
      return;
    }
    if (subscribed === "yes") {
      setIsWeb3Call(true);
    } else {
      const accountUrl = resolveService("account");
      window.open(
        `${accountUrl}/plans/?intent=checkout&product=talk`,
        "_self",
        "noopener"
      );
    }
  };

  const onClickSolAccount = () => {
    setWeb3Account("SOL");
    return;
  };

  const onClickEthAccount = () => {
    setWeb3Account("ETH");
    return;
  };
  const Body: React.FC = () => {
    if (!hasInitialRoomName && browser.isBrave === false) {
      return <DownloadBrave />;
    }

    if (!browser.supportsWebRTC) {
      return (
        <SectionWithLogo
          heading={t("talk_title")}
          subhead={t(
            "Your iOS device appears to have Lockdown Mode enabled, which prevents Brave Talk from working."
          )}
        />
      );
    }

    if (isWeb3Call && web3Account === null) {
      const popupContainerStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      };
      const popupContentStyle: React.CSSProperties = {
        background: "white",
        padding: "20px",
        borderRadius: "5px",
        textAlign: "center",
      };

      const buttonContainerStyle: React.CSSProperties = {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
      };

      const buttonStyle: React.CSSProperties = {
        margin: "0 10px",
        padding: "10px 20px",
        border: "solid 1px #ccc",
        borderRadius: "10px",
        backgroundColor: "transparent",
        color: "black",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        flex: 1,
      };

      const buttonWrapperStyle: React.CSSProperties = {
        display: "flex",
        width: "100%",
      };

      const logoStyle: React.CSSProperties = {
        width: "50px",
        height: "50px",
        marginBottom: "10px",
        borderRadius: "50%",
      };

      return (
        <div style={popupContainerStyle}>
          <div style={popupContentStyle}>
            <Text css={{ color: "black", display: "block" }} variant="header">
              Web3 Account
            </Text>
            <Text css={{ color: "black", display: "block" }} variant="body">
              Choose the network of the account you want to connect
            </Text>
            <Text css={{ color: "black" }} variant="body">
              start the Web3 call.
            </Text>
            <div style={buttonContainerStyle}>
              <div style={buttonWrapperStyle}>
                <button style={buttonStyle} onClick={onClickEthAccount}>
                  <img
                    src={require("../images/ethereum.svg")}
                    alt="Logo"
                    style={logoStyle}
                  />
                  <Text css={{ color: "black" }} variant="body">
                    Ethereum
                  </Text>
                </button>
                <button style={buttonStyle} onClick={onClickSolAccount}>
                  <img
                    src={require("../images/solana.svg")}
                    alt="Logo"
                    style={logoStyle}
                  />
                  <Text css={{ color: "black" }} variant="body">
                    Solana
                  </Text>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (isWeb3Call && web3Account === "SOL") {
      return (
        <StartCallSol
          setJwt={setJwt}
          setRoomName={setRoomName}
          jitsiContext={jitsiContext}
          setJitsiContext={setJitsiContext}
          isSubscribed={subscribed === "yes"}
        />
      );
    }
    if (isWeb3Call && web3Account === "ETH") {
      return (
        <StartCall
          setJwt={setJwt}
          setRoomName={setRoomName}
          jitsiContext={jitsiContext}
          setJitsiContext={setJitsiContext}
          isSubscribed={subscribed === "yes"}
        />
      );
    }

    return (
      <React.Fragment>
        <JoinCallSection
          subscribed={subscribed}
          browser={browser}
          onStartCall={onStartCall}
          notice={notice}
          disabled={disabled}
          hideButtons={hasInitialRoomName}
        />

        <Recordings />

        {!hasInitialRoomName && <SubscriptionCTA subscribed={subscribed} />}
        <Web3CTA onClick={onClickWeb3CTA} isSubscribed={subscribed === "yes"} />
      </React.Fragment>
    );
  };

  return (
    <Background>
      <Header subscribed={subscribed} />
      <div css={{ flexGrow: 1, padding: "0 12px" }}>
        <Body />
      </div>
      <Footer browser={browser} />
    </Background>
  );
};
