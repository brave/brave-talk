import { DispatchWithoutAction } from "react";
import { useSubscribedStatus } from "../hooks/subscription";
import { useBrowserProperties } from "../hooks/browser-properties";
import { Background } from "./Background";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JoinCallSection } from "./JoinCallSection";
import { SubscriptionCTA } from "./SubscriptionCTA";
import { DownloadBrave } from "./DownloadBrave";
import React from "react";
import { Recordings } from "./Recordings";

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

  const shouldShowDownloadBravePrompt =
    !hasInitialRoomName && browserProps && !browserProps.isBrave;

  return (
    <Background>
      <Header subscribed={subscribed} />
      <div css={{ flexGrow: 1, padding: "0 12px" }}>
        {shouldShowDownloadBravePrompt ? (
          <DownloadBrave />
        ) : (
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
        )}
      </div>
      <Footer />
    </Background>
  );
};
