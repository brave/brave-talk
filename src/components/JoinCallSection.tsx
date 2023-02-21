import { DispatchWithoutAction } from "react";
import { SubscriptionStatus } from "../hooks/subscription";
import { BrowserProperties } from "../rules";
import { Button } from "./Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { SectionWithLogo } from "./SectionWithLogo";

interface Props {
  subscribed: SubscriptionStatus;
  browser: BrowserProperties | undefined;
  notice?: string;
  disabled: boolean;
  hideButtons: boolean;
  onStartCall: DispatchWithoutAction;
}

export const JoinCallSection: React.FC<Props> = ({
  subscribed,
  browser,
  notice,
  onStartCall,
  disabled,
  hideButtons,
}) => {
  return (
    <SectionWithLogo
      heading={subscribed === "yes" ? "Brave Talk Premium" : "Brave Talk"}
      subhead={
        notice ??
        "Unlimited private video calls with your friends and colleagues"
      }
    >
      {!hideButtons && (
        <div css={{ display: "flex", flexDirection: "column" }}>
          <Button onClick={onStartCall} disabled={disabled}>
            {subscribed === "yes"
              ? "Start Premium call"
              : "Start free call (up to 4 people)"}
          </Button>

          {subscribed === "yes" && !browser?.isIOS && <CopyLinkButton />}
        </div>
      )}
    </SectionWithLogo>
  );
};
