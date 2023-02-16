import { SubscriptionStatus } from "../hooks/subscription";
import { resolveService } from "../services";

interface Props {
  subscribed: SubscriptionStatus;
}

export const Header: React.FC<Props> = ({ subscribed }) => (
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
        className="i18n-element-text"
        id="my_account_link"
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
        My Account
      </a>
    )}
  </div>
);
