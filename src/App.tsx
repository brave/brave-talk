import { css } from "@emotion/react";
import React from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import "./css/inter.css";
import { useBrowserProperties } from "./hooks/use-browser-properties";
import { useCallSetupStatus } from "./hooks/use-call-setup-status";
import { useParams } from "./hooks/use-params";
import { reportAction } from "./lib";

import "./i18n/i18next";
import { useEffect } from "react";

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
    setJwt,
    setRoomName,
    setJitsiContext,
  } = useCallSetupStatus(params.isCreate);

  const browserProps = useBrowserProperties();

  if (isCallReady && params.isCreateOnly) {
    reportAction("closing window as requested", params);
    window.close();
  }

  const initRouteTranscriptId = () => {
    const match = window.location.pathname.match(
      /^\/transcript-([a-z0-9]{50})$/,
    );
    if (match) {
      return match[1];
    }
  };
  const [routeTranscriptId, setRouteTranscriptId] = React.useState<
    string | undefined
  >(initRouteTranscriptId);
  const onRouterStatePushed = () => {
    setRouteTranscriptId(initRouteTranscriptId());
  };
  useEffect(() => {
    const onPopstate = onRouterStatePushed;
    window.addEventListener("popstate", onPopstate);
    return () => {
      window.removeEventListener("popstate", onPopstate);
    };
  });

  return (
    <React.Fragment>
      <GlobalStyles />
      <div css={styles.container}>
        {!routeTranscriptId && isCallReady && (
          <InCall
            roomName={roomName ?? ""}
            jwt={jwt ?? ""}
            isMobile={browserProps.isMobile}
            isCallReady={isCallReady}
            jitsiContext={jitsiContext}
          />
        )}
        {!isCallReady && (
          <WelcomeScreen
            onStartCall={onStartCall}
            notice={notice}
            disabled={isEstablishingCall}
            hasInitialRoomName={hasInitialRoom}
            browser={browserProps}
            setJwt={setJwt}
            setRoomName={setRoomName}
            jitsiContext={jitsiContext}
            setJitsiContext={setJitsiContext}
            onRouterStatePushed={onRouterStatePushed}
            displayTranscriptId={routeTranscriptId}
          />
        )}
      </div>
    </React.Fragment>
  );
};
