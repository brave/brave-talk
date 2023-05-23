import { useTranslation } from "react-i18next";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { resolveService } from "../services";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  subscribed: SubscriptionStatus;
}

export const SubscriptionCTA: React.FC<Props> = ({ subscribed }) => {
  const { t } = useTranslation();
  const subsUrl = resolveService("account");

  if (subscribed === "yes") {
    return null;
  }

  if (subscribed === "unknown") {
    return (
      <Section
        css={{
          minHeight: "calc(222px + 36px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        <img
          src={require("../images/spinner.svg")}
          alt="spinner"
          width={22}
          height={22}
          css={{ marginRight: 12 }}
        />
        <Text variant="subhead">{t("Checking subscription status...")}</Text>
      </Section>
    );
  }

  return (
    <Text variant="body">
      <Section>
        <h2 css={{ paddingTop: 34 }}>{t("premium_card_title")}</h2>
        <p css={{ marginBottom: 18 }}>{t("subscribe_text")}</p>
        <Button hollow>
          <a href={`${subsUrl}/plans/?intent=checkout&product=talk`}>
            {t("welcome_page_button_hollow")}
          </a>
        </Button>
        <div css={{ marginTop: 16 }}>{t("subscribe_login_text")}</div>
        <div css={{ marginTop: 16 }}>
          {t("subscribe_login_premium")}{" "}
          <a
            href={`${subsUrl}/account/?intent=recover&product=talk`}
            css={{ color: "inherit" }}
          >
            {t("subscribe_login_link")}
          </a>
          .
        </div>
      </Section>
    </Text>
  );
};
