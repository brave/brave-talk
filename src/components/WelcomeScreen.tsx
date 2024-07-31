import React, { DispatchWithoutAction } from "react";
import { css } from "@emotion/react";
import { useSubscribedStatus } from "../hooks/use-subscribed-status";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { Recordings } from "./Recordings";
import { SectionWithLogo } from "./SectionWithLogo";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { Web3CTA } from "./web3/Web3CTA";
import { StartCall } from "./web3/StartCall";
import { JitsiContext } from "../jitsi/types";
import { resolveService } from "../services";
import { Text } from "./Text";
import LeoPromo from "./LeoPromo";
import { MeetingTranscriptDisplay } from "./Transcript";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: TranslationKeys;
  disabled: boolean;
  hasInitialRoomName: boolean;
  browser: BrowserProperties;
  isWeb3Call: boolean;
  web3Account: "ETH" | "SOL" | null;
  jitsiContext: JitsiContext;
  setIsWeb3Call: (isWeb3Call: boolean) => void;
  setWeb3Account: (web3Account: "ETH" | "SOL") => void;
  setJwt: (jwt: string) => void;
  setRoomName: (roomName: string) => void;
  setJitsiContext: (context: JitsiContext) => void;
  onRouterStatePushed: () => void;
  displayTranscriptId: string | undefined;
}

export const WelcomeScreen = ({
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
  onRouterStatePushed,
  displayTranscriptId,
}: Props) => {
  const subscribed = useSubscribedStatus();
  const { t } = useTranslation();
  const onClickWeb3CTA = () => {
    if (subscribed === "yes") {
      setIsWeb3Call(true);
    } else {
      const accountUrl = resolveService("account");
      window.open(
        `${accountUrl}/plans/?intent=checkout&product=talk`,
        "_self",
        "noopener",
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
  const Body = () => {
    if (displayTranscriptId) {
      return <MeetingTranscriptDisplay transcriptId={displayTranscriptId} />;
    }

    if (!browser.supportsWebRTC) {
      return (
        <SectionWithLogo
          heading={t("talk_title")}
          subhead={t(
            "Your iOS device appears to have Lockdown Mode enabled, which prevents Brave Talk from working.",
          )}
        />
      );
    }

    if (isWeb3Call && web3Account === null) {
      // Define styles using the css prop
      const popupContainerStyle = css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `;

      const popupContentStyle = css`
        background: white;
        padding: 20px;
        border-radius: 5px;
        text-align: center;
      `;

      const buttonContainerStyle = css`
        margin-top: 20px;
        display: flex;
        justify-content: center;
      `;

      const buttonStyle = css`
        margin: 0 10px;
        padding: 10px 20px;
        border: solid 1px #ccc;
        border-radius: 10px;
        background-color: transparent;
        color: black;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        flex: 1;
      `;

      const buttonWrapperStyle = css`
        display: flex;
        width: 100%;
      `;

      const logoStyle = css`
        width: 50px;
        height: 50px;
        margin-bottom: 10px;
        border-radius: 50%;
      `;

      return (
        <div css={popupContainerStyle}>
          <div css={popupContentStyle}>
            <Text css={{ color: "black", display: "block" }} variant="header">
              Web3 Account
            </Text>
            <Text css={{ color: "black", display: "block" }} variant="body">
              {t("web3_account_body")}
            </Text>
            <div css={buttonContainerStyle}>
              <div css={buttonWrapperStyle}>
                <button css={buttonStyle} onClick={onClickEthAccount}>
                  <img
                    src={require("../images/ethereum.svg")}
                    alt="Logo"
                    css={logoStyle}
                  />
                  <Text css={{ color: "black" }} variant="body">
                    Ethereum
                  </Text>
                </button>
                <button css={buttonStyle} onClick={onClickSolAccount}>
                  <img
                    src={require("../images/solana.svg")}
                    alt="Logo"
                    css={logoStyle}
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
    if (isWeb3Call && web3Account !== null) {
      return (
        <StartCall
          setJwt={setJwt}
          setRoomName={setRoomName}
          jitsiContext={jitsiContext}
          setJitsiContext={setJitsiContext}
          web3Account={web3Account}
          setWeb3Account={setWeb3Account}
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

        <LeoPromo />

        <Recordings onRouterStatePushed={onRouterStatePushed} />

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
