import { css } from "@emotion/react";
import React from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { JoinCall as JoinWeb3Call } from "./components/web3/JoinCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import { useBrowserProperties } from "./hooks/use-browser-properties";
import { useCallSetupStatus } from "./hooks/use-call-setup-status";
import { useParams } from "./hooks/use-params";
import { reportAction } from "./lib";

import "./i18n/i18next";

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
    isCallReady,
    web3,
  } = useCallSetupStatus(params.isCreate);

  const browserProps = useBrowserProperties();

  if (isCallReady && params.isCreateOnly) {
    reportAction("closing window as requested", params);
    window.close();
  }

  return (
    <React.Fragment>
      <GlobalStyles />

      <div css={styles.container}>
        {!web3.isWeb3Call && isCallReady ? (
          <InCall
            roomName={roomName as string}
            jwt={jwt as string}
            isMobile={browserProps.isMobile}
          />
        ) : web3.isWeb3Call && hasInitialRoom ? (
          <JoinWeb3Call
            roomName={roomName}
            web3Address={web3.web3Address}
            setWeb3Address={web3.setWeb3Address}
          />
        ) : (
          <WelcomeScreen
            onStartCall={onStartCall}
            notice={notice}
            disabled={isEstablishingCall}
            hasInitialRoomName={hasInitialRoom}
            browser={browserProps}
            isWeb3Call={web3.isWeb3Call}
            setIsWeb3Call={web3.setIsWeb3Call}
            isCallReady={isCallReady}
          />
        )}
      </div>
    </React.Fragment>
  );
};
