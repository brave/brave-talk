import { DispatchWithoutAction } from "react";
import { SubscriptionStatus } from "../hooks/subscription";
import { BrowserProperties } from "../rules";
import { Button } from "./Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  subscribed: SubscriptionStatus;
  browser: BrowserProperties | undefined;
  notice?: string;
  disabled: boolean;
  hideButtons: boolean;
  onStartCall: DispatchWithoutAction;
}

export const JoinCallSection: React.FC<Props> = ({
  subscribed,
  browser,
  notice,
  onStartCall,
  disabled,
  hideButtons,
}) => {
  return (
    <Section additionalCss={{ marginTop: 122 }}>
      <div
        css={{
          "--talk-logo-size": "122px",
          backgroundImage: `url(${require("../images/talkLogo.svg")})`,
          backgroundSize: "var(--talk-logo-size) var(--talk-logo-size)",
          width: "var(--talk-logo-size)",
          height: "var(--talk-logo-size)",
          marginTop: "calc(var(--talk-logo-size) / -2)",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div
        css={{
          margin: "0 auto 36px",
          display: "flex",
          flexDirection: "column",
          maxWidth: "calc(100% - 40px)",
          width: "570px",
          zIndex: 2,
          "@media only screen and (max-height: 600px) and (max-width: 600px)": {
            marginBottom: "22px",
          },
        }}
      >
        <h1 css={{ margin: "95px 0 0" }}>
          <Text variant="header">
            {subscribed === "yes" ? "Brave Talk Premium" : "Brave Talk"}
          </Text>
        </h1>
        <p css={{ margin: "8px 0 0" }}>
          <Text variant="subhead">
            {notice ??
              "Unlimited private video calls with your friends and colleagues"}
          </Text>
        </p>
      </div>
      {!hideButtons && (
        <div css={{ display: "flex", flexDirection: "column" }}>
          <Button onClick={onStartCall} disabled={disabled}>
            {subscribed === "yes"
              ? "Start Premium call"
              : "Start free call (up to 4 people)"}
          </Button>

          {subscribed === "yes" && !browser?.isIOS && <CopyLinkButton />}
        </div>
      )}

      {/*
      <div className="download-brave" id="download_brave">
        <div
          className="download-brave-text i18n-element-text"
          id="download_brave_text"
        >
          Want better privacy than Zoom? Download the Brave browser to start a
          call with Brave Talk.
        </div>
        <div className="download-button-container">
          <a
            className="welcome-page-button welcome-page-button-with-icon"
            href="https://brave.com/download/bravetalk"
          >
            <div className="brave-icon"></div>
            <div
              className="welcome-page-button-download-text i18n-element-text"
              id="welcome_page_button_download_text"
            >
              Download Brave
            </div>
          </a>
        </div>
      </div> */}
    </Section>
  );
};
