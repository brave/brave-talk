import { DispatchWithoutAction } from "react";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { Button } from "./Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { Section } from "./Section";
import { resolveService } from "../services";

interface Props {
  subscribed: SubscriptionStatus;
  browser: BrowserProperties;
  notice?: TranslationKeys;
  disabled: boolean;
  hideButtons: boolean;
  onStartCall: DispatchWithoutAction;
}

export const JoinCallSection = ({
  subscribed,
  browser,
  notice,
  onStartCall,
  disabled,
  hideButtons,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Section
      css={{
        padding: 0,
        overflow: "hidden",
        // This card lays out its own sections, so it opts out of Section's
        // responsive padding at every breakpoint.
        "@media only screen and (max-width: 600px)": { padding: 0 },
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "24px",
          "@media only screen and (max-width: 720px)": {
            alignItems: "flex-start",
            flexWrap: "wrap",
          },
          "@media only screen and (max-width: 600px)": {
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          },
        }}
      >
        <div
          css={{
            display: "contents",
            "@media only screen and (max-width: 600px)": {
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            },
          }}
        >
          <img
            src={require("../images/homepage/talk-logo.svg")}
            alt=""
            width={72}
            height={72}
            css={{ flexShrink: 0 }}
          />
          <div
            css={{
              minWidth: 0,
              flex: 1,
              textAlign: "left",
              "@media only screen and (max-width: 600px)": {
                flex: "none",
                width: "100%",
                textAlign: "center",
              },
            }}
          >
            <h1
              css={{
                margin: 0,
                color: "#ffffff",
                fontSize: "34px",
                fontWeight: 600,
                lineHeight: "40px",
                letterSpacing: "-0.5px",
              }}
            >
              {t("talk_title")}
            </h1>
            <p
              css={{
                margin: 0,
                color: "#c9c9ca",
                fontSize: "22px",
                lineHeight: "28px",
                letterSpacing: "-0.5px",
              }}
            >
              {notice ? t(notice) : t("notice_text")}
            </p>
          </div>
        </div>

        {!hideButtons && (
          <div
            css={{
              display: "flex",
              width: "260px",
              flexShrink: 0,
              flexDirection: "column",
              gap: "8px",
              "@media only screen and (max-width: 720px)": {
                width: "100%",
              },
            }}
          >
            <Button
              variant={subscribed === "yes" ? "hero" : "light"}
              size="jumbo"
              onClick={onStartCall}
              disabled={disabled}
            >
              {subscribed === "yes"
                ? t("Start Premium call")
                : t("Start free call")}
            </Button>

            {subscribed === "yes" && !browser.isIOS ? (
              <CopyLinkButton />
            ) : (
              subscribed !== "yes" && (
                <div
                  css={{
                    color: "#aaaaad",
                    fontSize: "12px",
                    lineHeight: "18px",
                  }}
                >
                  {t("free_call_limit")}{" "}
                  <a
                    href={`${resolveService("account")}/plans/?intent=checkout&product=talk`}
                    css={{ color: "inherit", textUnderlineOffset: "2px" }}
                  >
                    {t("free_call_premium_link")}
                  </a>
                  .
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div
        css={{
          display: "flex",
          alignItems: "flex-end",
          padding: "16px 24px 24px",
          "@media only screen and (max-width: 600px)": {
            padding: "0 8px 8px",
          },
        }}
      >
        <div
          css={{
            zIndex: 1,
            display: "grid",
            width: "48px",
            height: "48px",
            marginRight: "-20px",
            marginBottom: "8px",
            flexShrink: 0,
            placeItems: "center",
            borderRadius: "50%",
            background: "#252527",
            "@media only screen and (max-width: 600px)": { display: "none" },
          }}
        >
          <img
            src={require("../images/homepage/leo-icon.svg")}
            alt=""
            width={32}
            height={32}
          />
        </div>
        <img
          src={require("../images/homepage/leo-tail.svg")}
          alt=""
          width={32}
          height={32}
          css={{
            marginRight: "-1px",
            flexShrink: 0,
            "@media only screen and (max-width: 600px)": { display: "none" },
          }}
        />
        <div
          css={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: "24px 24px 24px 0",
            background: "#252527",
            textAlign: "left",
            "@media only screen and (max-width: 600px)": {
              padding: "24px 32px",
              borderRadius: "16px",
            },
          }}
        >
          <div
            css={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <strong
              css={{
                fontSize: "20px",
                lineHeight: "26px",
                letterSpacing: "-0.5px",
              }}
            >
              {t("leo_meetings_title")}
            </strong>
            <span
              css={{
                padding: "2px 6px",
                borderRadius: "4px",
                background: "#626267",
                fontSize: "10px",
                lineHeight: "14px",
              }}
            >
              {t("free_call_premium_link")}
            </span>
          </div>
          <p
            css={{
              margin: 0,
              color: "#aaaaad",
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            {t("leo_meetings_description")}{" "}
            <a
              href="https://brave.com/talk/"
              target="_blank"
              rel="noreferrer"
              css={{ color: "inherit", textUnderlineOffset: "2px" }}
            >
              {t("recovery_token_learn_more")}
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
};
