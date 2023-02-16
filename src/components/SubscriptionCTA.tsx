import { SubscriptionStatus } from "../hooks/subscription";
import { resolveService } from "../services";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  subscribed: SubscriptionStatus;
}

export const SubscriptionCTA: React.FC<Props> = ({ subscribed }) => {
  if (subscribed === "yes") {
    return null;
  }

  if (subscribed === "unknown") {
    return (
      <Section
        additionalCss={{
          minHeight: "calc(167px + 36px)",
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
        <Text variant="subhead">Checking subscription status...</Text>
      </Section>
    );
  }

  return (
    <Text variant="body">
      <Section>
        <p css={{ marginBottom: 18, paddingTop: 34 }}>
          Upgrade to host video calls with hundreds of participants.
        </p>
        <Button hollow>Start free trial</Button>
        <div css={{ marginTop: 16 }}>
          Get 30 days of access to Brave Talk Premium, free of charge. After 30
          days, the credit card you enter will be charged $7.00 US monthly. You
          can cancel any time.
        </div>
        <div css={{ marginTop: 16 }}>
          Already have Premium?{" "}
          <a href={resolveService("account")} css={{ color: "inherit" }}>
            Log in
          </a>
          .
        </div>
      </Section>
    </Text>
  );
};
