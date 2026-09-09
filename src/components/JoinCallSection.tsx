import { DispatchWithoutAction } from "react";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { Button } from "./Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { Trans, useTranslation } from "react-i18next";
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

  // While a call is being established the progress messages take over the
  // button label; anything left over afterwards (ie an error) stays in the
  // subhead, where it's also shown when there is no button to speak of.
  const buttonStatus = !hideButtons && disabled ? notice : undefined;

  return (
    <Section
      css={{
        padding: "var(--leo-spacing-none)",
        overflow: "hidden",
        // This card lays out its own sections, so it opts out of Section's
        // responsive padding at every breakpoint.
        "@media only screen and (max-width: 600px)": {
          padding: "var(--leo-spacing-none)",
        },
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: "var(--leo-spacing-xl)",
          padding: "var(--leo-spacing-2xl)",
          "@media only screen and (max-width: 720px)": {
            alignItems: "flex-start",
            flexWrap: "wrap",
          },
          "@media only screen and (max-width: 600px)": {
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--leo-spacing-2xl)",
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
              gap: "var(--leo-spacing-xl)",
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
                margin: "var(--leo-spacing-none)",
                color: "var(--leo-color-white)",
                font: "var(--leo-font-heading-display3)",
                letterSpacing:
                  "var(--leo-typography-heading-display3-letter-spacing)",
              }}
            >
              {t("talk_title")}
            </h1>
            <p
              css={{
                margin: "var(--leo-spacing-none)",
                color: "var(--leo-color-primitive-neutral-80)",
                font: "var(--leo-font-heading-h2)",
                letterSpacing:
                  "var(--leo-typography-heading-h2-letter-spacing)",
              }}
            >
              {notice && !buttonStatus ? t(notice) : t("notice_text")}
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
              gap: "var(--leo-spacing-m)",
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
              <span aria-live="polite">
                {buttonStatus
                  ? t(buttonStatus)
                  : subscribed === "yes"
                    ? t("Start premium call")
                    : t("Start free call")}
              </span>
            </Button>

            {subscribed === "yes" && !browser.isIOS ? (
              <CopyLinkButton />
            ) : (
              subscribed !== "yes" && (
                <div
                  css={{
                    color: "var(--leo-color-primitive-neutral-70)",
                    font: "var(--leo-font-small-regular)",
                  }}
                >
                  {t("free_call_limit")}{" "}
                  <a
                    href={`${resolveService("account")}/plans/?intent=checkout&product=talk`}
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
          padding:
            "var(--leo-spacing-xl) var(--leo-spacing-2xl) var(--leo-spacing-2xl)",
          "@media only screen and (max-width: 600px)": {
            display: "none",
          },
        }}
      >
        <div
          css={{
            zIndex: 1,
            display: "grid",
            width: "48px",
            height: "48px",
            marginRight: "calc(-1 * var(--leo-spacing-xl))",
            marginBottom: "var(--leo-spacing-m)",
            flexShrink: 0,
            placeItems: "center",
            borderRadius: "50%",
            background: "var(--leo-color-primitive-neutral-15)",
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
            marginRight: "calc(-1 * var(--leo-spacing-xs) / 2)",
            flexShrink: 0,
          }}
        />
        <div
          css={{
            flex: 1,
            padding:
              "calc(var(--leo-spacing-xl) + var(--leo-spacing-s)) var(--leo-spacing-2xl)",
            borderRadius:
              "var(--leo-radius-xxl) var(--leo-radius-xxl) var(--leo-radius-xxl) var(--leo-spacing-none)",
            background: "var(--leo-color-primitive-neutral-15)",
            textAlign: "left",
          }}
        >
          <div
            css={{
              display: "flex",
              alignItems: "center",
              gap: "var(--leo-spacing-m)",
              marginBottom:
                "calc(var(--leo-spacing-s) + var(--leo-spacing-xs))",
            }}
          >
            <strong
              css={{
                font: "var(--leo-font-heading-h3)",
                letterSpacing:
                  "var(--leo-typography-heading-h3-letter-spacing)",
              }}
            >
              {t("leo_meetings_title")}
            </strong>
            <span
              css={{
                padding:
                  "var(--leo-spacing-xs) calc(var(--leo-spacing-s) + var(--leo-spacing-xs))",
                borderRadius: "var(--leo-radius-s)",
                background: "var(--leo-color-primitive-neutral-40)",
                font: "var(--leo-font-x-small-regular)",
              }}
            >
              {t("free_call_premium_link")}
            </span>
          </div>
          <p
            css={{
              margin: "var(--leo-spacing-none)",
              color: "var(--leo-color-primitive-neutral-70)",
              font: "var(--leo-font-large-regular)",
            }}
          >
            {t("leo_meetings_description")}{" "}
            <Trans i18nKey="learn_more">
              <a
                href="https://brave.com/talk/"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
              {"."}
            </Trans>
          </p>
        </div>
      </div>
    </Section>
  );
};
