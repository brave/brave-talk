import { useTranslation } from "react-i18next";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { resolveService } from "../services";

interface Props {
  subscribed: SubscriptionStatus;
}

export const Header: React.FC<Props> = ({ subscribed }) => {
  const { t } = useTranslation();
  return (
    <div>
      <a
        css={{
          display: "block",
          position: "absolute",
          width: "131px",
          height: "40px",
          top: "24px",
          left: "24px",
          outline: "none",
        }}
        href="https://brave.com/download/bravetalk"
      >
        <img src={require("../images/brave_logo_dark.svg")} alt="brave" />
      </a>

      {subscribed === "yes" && (
        <a
          href={resolveService("account")}
          css={{
            display: "block",
            position: "absolute",
            right: "24px",
            top: "29px",
            fontStyle: "normal",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          {t("my_account_link")}
        </a>
      )}
    </div>
  );
};
