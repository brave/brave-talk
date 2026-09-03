import { useTranslation } from "react-i18next";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { premiumLoginUrl, resolveService } from "../services";

interface Props {
  subscribed: SubscriptionStatus;
}

export const Header = ({ subscribed }: Props) => {
  const { t } = useTranslation();
  const isPremium = subscribed === "yes";

  return (
    <header
      css={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px",
        "@media only screen and (max-width: 600px)": {
          padding: "24px",
        },
      }}
    >
      <a
        css={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "129px",
          height: "40px",
          outline: "none",
        }}
        href="https://brave.com/download/bravetalk"
      >
        <img
          src={require("../images/homepage/brave-icon.svg")}
          alt=""
          width={35}
          height={40}
        />
        <img
          src={require("../images/homepage/brave-wordmark.svg")}
          alt="Brave"
          width={86}
          height={24}
        />
      </a>

      <a
        href={isPremium ? resolveService("account") : premiumLoginUrl()}
        css={{
          padding: "8px 16px",
          borderRadius: "999px",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "20px",
          color: "#ffffff",
          textDecoration: "none",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.08)",
          },
        }}
      >
        {isPremium ? t("my_account_link") : t("subscribe_login_link")}
      </a>
    </header>
  );
};
