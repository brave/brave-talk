import { css } from "@emotion/react";
import React from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import { useCallSetupStatus } from "./hooks/call-setup";

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
  const { roomName, jwt, onStartCall, notice } = useCallSetupStatus();

  const isCallReady = roomName && jwt;

  return (
    <React.Fragment>
      <GlobalStyles />

      <div css={styles.container}>
        {isCallReady ? (
          <InCall roomName={roomName} jwt={jwt} isMobile={false} />
        ) : (
          <WelcomeScreen onStartCall={onStartCall} notice={notice} />
        )}
      </div>
    </React.Fragment>
  );
};
