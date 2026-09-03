import React, { DispatchWithoutAction, lazy, Suspense } from "react";
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
import RecoveryTokenBox from "./RecoveryTokenBox";

const MeetingTranscriptDisplay = lazy(() => import("./Transcript"));

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

  // Rendered by calling it, not as <Body />: a component declared inside the
  // render gets a fresh identity every time, so React would throw away and
  // remount the whole screen on each state change.
  const renderBody = () => {
    if (displayTranscriptId) {
      return (
        <Suspense>
          <MeetingTranscriptDisplay transcriptId={displayTranscriptId} />
        </Suspense>
      );
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

        {!hasInitialRoomName && <SubscriptionCTA subscribed={subscribed} />}

        <RecoveryTokenBox subscribed={subscribed} />

        <Recordings onRouterStatePushed={onRouterStatePushed} />
      </React.Fragment>
    );
  };

  return (
    <Background>
      <Header subscribed={subscribed} />
      <main
        css={{
          display: "flex",
          width: "100%",
          maxWidth: "980px",
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "center",
          margin: "var(--leo-spacing-none) auto",
          padding: "var(--leo-spacing-none) var(--leo-spacing-xl)",
          "@media only screen and (max-width: 600px)": {
            justifyContent: "flex-start",
            padding:
              "var(--leo-spacing-none) var(--leo-spacing-m) var(--leo-spacing-m)",
          },
        }}
      >
        {renderBody()}
      </main>
      <Footer browser={browser} />
    </Background>
  );
};
