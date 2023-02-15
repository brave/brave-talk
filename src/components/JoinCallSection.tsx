import { Button } from "./Button";
import { Section } from "./Section";

const converted = {
  ".join-call-text": {
    margin: "0 auto 36px",
    display: "flex",
    flexDirection: "column",
    maxWidth: "calc(100% - 40px)",
    width: "570px",
    zIndex: 2,
  },
  "@media only screen and (max-height: 600px) and (max-width: 600px)": {
    ".join-call-text": { marginBottom: "22px" },
  },
};

export const JoinCallSection: React.FC = () => {
  return (
    <Section additionalCss={{ margin: "122px auto 0" }}>
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
        <h1
          css={{
            margin: "95px 0 0",
            fontSize: "36px",
            fontWeight: 600,
            lineHeight: "60px",
            color: "#f0f2ff",
          }}
        >
          Brave Talk
        </h1>
        <p
          css={{
            fontStyle: "normal",
            fontWeight: 600,
            fontSize: "15px",
            lineHeight: "20px",
            textAlign: "center",
            letterSpacing: "0.04em",
            margin: "8px 0 0",
          }}
          id="notice_text"
        >
          Unlimited private video calls with your friends and colleagues
        </p>
      </div>
      <Button label="Start Call" />
      {/* <button
        className="welcome-page-button welcome-page-button-with-icon welcome-page-gutter-top i18n-element-end"
        id="copy_link"
      >
        <div className="copy-icon"></div>
        <span className="i18n-element-text" id="create_link">
          Create link
        </span>
      </button>

      <div
        className="welcome-page-button welcome-page-button-with-icon welcome-page-button-loading"
        id="enter_room_loading"
      >
        <div className="spinner"></div>
        <div className="i18n-element-text" id="loading">
          Loading...
        </div>
      </div>
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
      </div>
      <div className="desktop-needed" id="desktop_needed">
        <div
          className="desktop-needed-info i18n-element-text"
          id="desktop_needed_info"
        >
          You can only join Brave Talk calls from your mobile device on the free
          plan.
        </div>
        <div
          className="desktop-needed-cta i18n-element-text"
          id="desktop_needed_cta"
        >
          Use Brave Browser on your desktop to start a free call, or upgrade to
          Premium.
        </div> 
        </div> */}
    </Section>
  );
};
