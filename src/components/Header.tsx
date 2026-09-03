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
        padding: "var(--leo-spacing-2xl)",
        "@media only screen and (max-width: 600px)": {
          padding: "var(--leo-spacing-2xl)",
        },
      }}
    >
      <a
        css={{
          display: "flex",
          alignItems: "center",
          gap: "var(--leo-spacing-m)",
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
          padding: "var(--leo-spacing-m) var(--leo-spacing-xl)",
          borderRadius: "var(--leo-radius-full)",
          font: "var(--leo-font-components-button-default)",
          color: "var(--leo-color-white)",
          textDecoration: "none",
          "&:hover": {
            background:
              "color-mix(in srgb, var(--leo-color-white) 8%, transparent)",
          },
        }}
      >
        {isPremium ? t("my_account_link") : t("subscribe_login_link")}
      </a>
    </header>
  );
};
