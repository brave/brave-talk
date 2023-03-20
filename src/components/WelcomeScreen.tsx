import { DispatchWithoutAction, useState } from "react";
import { useSubscribedStatus } from "../hooks/use-subscribed-status";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { DownloadBrave } from "./DownloadBrave";
import React from "react";
import { Recordings } from "./Recordings";
import { SectionWithLogo } from "./SectionWithLogo";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { Web3CTA } from "./web3/Web3CTA";
import { StartCall } from "./web3/StartCall";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: TranslationKeys;
  disabled: boolean;
  hasInitialRoomName: boolean;
  browser: BrowserProperties;
}

export const WelcomeScreen: React.FC<Props> = ({
  onStartCall,
  notice,
  disabled,
  hasInitialRoomName,
  browser,
}) => {
  const subscribed = useSubscribedStatus();
  const [web3startCallScreen, setWeb3StartCallScreen] = useState(false);
  const { t } = useTranslation();

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

    if (web3startCallScreen) {
      return <StartCall />;
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

        <Web3CTA onClick={() => setWeb3StartCallScreen(true)} />

        <Recordings />

        {!hasInitialRoomName && <SubscriptionCTA subscribed={subscribed} />}
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
