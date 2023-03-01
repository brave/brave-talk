import { css } from "@emotion/react";
import React from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import { useBrowserProperties } from "./hooks/use-browser-properties";
import { useCallSetupStatus } from "./hooks/use-call-setup-status";
import { useParams } from "./hooks/use-params";
import { reportAction } from "./lib";

const styles = {
  container: css({
    position: "fixed",
    top: "0",
    bottom: "0",
    right: "0",
    left: "0",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  }),
};

export const App: React.FC = () => {
  const params = useParams();

  const {
    roomName,
    jwt,
    onStartCall,
    notice,
    isEstablishingCall,
    hasInitialRoom,
  } = useCallSetupStatus(params.isCreate);

  const browserProps = useBrowserProperties();

  const isCallReady = roomName && jwt;

  if (isCallReady && params.isCreateOnly) {
    reportAction("closing window as requested", params);
    window.close();
  }

  return (
    <React.Fragment>
      <GlobalStyles />

      <div css={styles.container}>
        {isCallReady ? (
          <InCall
            roomName={roomName}
            jwt={jwt}
            isMobile={browserProps.isMobile}
          />
        ) : (
          <WelcomeScreen
            onStartCall={onStartCall}
            notice={notice}
            disabled={isEstablishingCall}
            hasInitialRoomName={hasInitialRoom}
            browser={browserProps}
          />
        )}
      </div>
    </React.Fragment>
  );
};
