import React, { DispatchWithoutAction } from "react";
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
import { JitsiContext } from "../jitsi/types";
import LeoPromo from "./LeoPromo";
import { MeetingTranscriptDisplay } from "./Transcript";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: TranslationKeys;
  disabled: boolean;
  hasInitialRoomName: boolean;
  browser: BrowserProperties;
  jitsiContext: JitsiContext;
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
  onRouterStatePushed,
  displayTranscriptId,
}: Props) => {
  const subscribed = useSubscribedStatus();
  const { t } = useTranslation();

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
