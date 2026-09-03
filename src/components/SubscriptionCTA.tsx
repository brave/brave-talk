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
          gap: "12px",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <img
          src={require("../images/spinner.svg")}
          alt="spinner"
          width={22}
          height={22}
        />
        <span css={{ fontSize: "15px", fontWeight: 600 }}>
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
        gap: "32px",
        textAlign: "left",
        "@media only screen and (max-width: 720px)": {
          alignItems: "stretch",
          flexDirection: "column",
          gap: "24px",
        },
      }}
    >
      <div id="premium-calls" css={{ minWidth: 0, flex: 1 }}>
        <h2
          css={{
            margin: "0 0 8px",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "22px",
            lineHeight: "28px",
            letterSpacing: "-0.5px",
          }}
        >
          {t("premium_card_title")}
        </h2>
        <p
          css={{
            margin: 0,
            color: "#aaaaad",
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "-0.23px",
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
