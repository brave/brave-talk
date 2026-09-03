import { useTranslation } from "react-i18next";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { premiumLoginUrl, resolveService } from "../services";
import { Button } from "./Button";
import { Section } from "./Section";

interface Props {
  subscribed: SubscriptionStatus;
}

export const SubscriptionCTA = ({ subscribed }: Props) => {
  const { t } = useTranslation();
  const subsUrl = resolveService("account");

  if (subscribed === "yes") {
    return null;
  }

  if (subscribed === "unknown") {
    return (
      <Section
        css={{
          minHeight: "130px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "var(--leo-spacing-l)",
          color: "color-mix(in srgb, var(--leo-color-white) 50%, transparent)",
        }}
      >
        <img
          src={require("../images/spinner.svg")}
          alt="spinner"
          width={22}
          height={22}
        />
        <span css={{ font: "var(--leo-font-default-semibold)" }}>
          {t("Checking subscription status...")}
        </span>
      </Section>
    );
  }

  return (
    <Section
      css={{
        display: "flex",
        alignItems: "center",
        gap: "var(--leo-spacing-3xl)",
        textAlign: "left",
        "@media only screen and (max-width: 720px)": {
          alignItems: "stretch",
          flexDirection: "column",
          gap: "var(--leo-spacing-2xl)",
        },
      }}
    >
      <div id="premium-calls" css={{ minWidth: 0, flex: 1 }}>
        <h2
          css={{
            margin:
              "var(--leo-spacing-none) var(--leo-spacing-none) var(--leo-spacing-m)",
            color: "var(--leo-color-white)",
            font: "var(--leo-font-heading-h2)",
            letterSpacing: "var(--leo-typography-heading-h2-letter-spacing)",
          }}
        >
          {t("premium_card_title")}
        </h2>
        <p
          css={{
            margin: "var(--leo-spacing-none)",
            color: "var(--leo-color-primitive-neutral-70)",
            font: "var(--leo-font-large-regular)",
            letterSpacing: "var(--leo-typography-large-regular-letter-spacing)",
          }}
        >
          {t("premium_calls_description")} {t("subscribe_login_premium")}{" "}
          <a
            href={premiumLoginUrl()}
            css={{ color: "inherit", textUnderlineOffset: "2px" }}
          >
            {t("subscribe_login_link")}
          </a>
          .
        </p>
      </div>
      <div css={{ flexShrink: 0 }}>
        <a
          href={`${subsUrl}/plans/?intent=checkout&product=talk`}
          css={{ textDecoration: "none" }}
        >
          <Button
            variant="hero"
            size="large"
            css={{
              "@media only screen and (max-width: 720px)": {
                width: "100%",
              },
            }}
          >
            {t("start_trial_seven_days")}
          </Button>
        </a>
      </div>
    </Section>
  );
};
