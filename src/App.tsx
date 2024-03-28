import { css } from "@emotion/react";
import React from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { JoinCall as JoinWeb3Call } from "./components/web3/JoinCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import "./css/inter.css";
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

export const App = () => {
  const params = useParams();

  const {
    roomName,
    jwt,
    onStartCall,
    notice,
    isEstablishingCall,
    hasInitialRoom,
    jitsiContext,
    isCallReady,
    isWeb3Call,
    setIsWeb3Call,
    web3Account,
    setWeb3Account,
    setJwt,
    setRoomName,
    setJitsiContext,
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
        <InCall
          roomName={roomName ?? ""}
          jwt={jwt ?? ""}
          isMobile={browserProps.isMobile}
          isCallReady={isCallReady}
          isWeb3Call={isWeb3Call}
          jitsiContext={jitsiContext}
        />
        {!isCallReady &&
          (isWeb3Call && hasInitialRoom ? (
            <JoinWeb3Call
              roomName={roomName as string}
              setJwt={setJwt}
              jitsiContext={jitsiContext}
              setJitsiContext={setJitsiContext}
              web3Account={web3Account}
              setWeb3Account={setWeb3Account}
            />
          ) : (
            <WelcomeScreen
              onStartCall={onStartCall}
              notice={notice}
              disabled={isEstablishingCall}
              hasInitialRoomName={hasInitialRoom}
              browser={browserProps}
              isWeb3Call={isWeb3Call}
              setIsWeb3Call={setIsWeb3Call}
              web3Account={params.isSolana ? web3Account : "ETH"}
              setWeb3Account={setWeb3Account}
              setJwt={setJwt}
              setRoomName={setRoomName}
              jitsiContext={jitsiContext}
              setJitsiContext={setJitsiContext}
            />
          ))}
      </div>
    </React.Fragment>
  );
};
