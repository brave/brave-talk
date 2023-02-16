import { css } from "@emotion/react";
import React, { StrictMode } from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { InCall } from "./components/InCall";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";
import { useCallSetupStatus } from "./hooks/call-setup";

/*
some startup logic that happens at this point:

1. if we've got an order parameter, parse it and pass it onto subscriptions for processing
   and then if there's an auto open room parameter behave as if that was on the url

2. if we've got a room name and webrtc is supported:
    - if create_only=y go straight into the room, create it, then close the window
    - otherwise try to get the token then open the room
    - if "create=y" then do some fancy retry logic if the join fails

3. otherwise show the home page

*/

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
    <StrictMode>
      <GlobalStyles />

      <div css={styles.container}>
        <pre>{JSON.stringify({ roomName, jwt, isCallReady, notice })}</pre>
        {isCallReady ? (
          <InCall />
        ) : (
          <WelcomeScreen onStartCall={onStartCall} notice={notice} />
        )}
      </div>
    </StrictMode>
  );
};
