import { DispatchWithoutAction } from "react";
import { useSubscribedStatus } from "../hooks/use-subscribed-status";
import { useBrowserProperties } from "../hooks/use-browser-properties";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { DownloadBrave } from "./DownloadBrave";
import React from "react";
import { Recordings } from "./Recordings";
import { SectionWithLogo } from "./SectionWithLogo";

interface Props {
  onStartCall: DispatchWithoutAction;
  notice?: string;
  disabled: boolean;
  hasInitialRoomName: boolean;
}

export const WelcomeScreen: React.FC<Props> = ({
  onStartCall,
  notice,
  disabled,
  hasInitialRoomName,
}) => {
  const browserProps = useBrowserProperties();
  const subscribed = useSubscribedStatus();

  const Body: React.FC = () => {
    if (!hasInitialRoomName && browserProps && !browserProps.isBrave) {
      return <DownloadBrave />;
    }

    if (browserProps && !browserProps.supportsWebRTC) {
      return (
        <SectionWithLogo
          heading="Brave Talk"
          subhead="Your iOS device appears to have Lockdown Mode enabled, which prevents Brave Talk from working."
        />
      );
    }
    return (
      <React.Fragment>
        <JoinCallSection
          subscribed={subscribed}
          browser={browserProps}
          onStartCall={onStartCall}
          notice={notice}
          disabled={disabled}
          hideButtons={hasInitialRoomName}
        />

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
      {browserProps && <Footer browser={browserProps} />}
    </Background>
  );
};
