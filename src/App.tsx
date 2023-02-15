import React, { StrictMode } from "react";
import { GlobalStyles } from "./components/GlobalStyles";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./css/poppins.css";

/*
some startup logic that happens at this point:

1. if we've got an order parameter, parse it and pass it onto subscriptions for processing
   and then if there's an auto open room parameter behave as if that was on the url

2. if we've got a room name and webrtc is supported:
    - if create_only=y go straight into the room, create it, then close the window
    - otherwise try to get the token then open the room
    - if "create=y" then do some fancy retry logic if the join fails

3. otherwise show the home page, with subscription status or 

*/
export const App: React.FC = () => {
  return (
    <StrictMode>
      <GlobalStyles />

      <div
        css={{
          position: "fixed",
          top: "0",
          bottom: "0",
          right: "0",
          left: "0",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <WelcomeScreen />
      </div>
    </StrictMode>
  );
};
