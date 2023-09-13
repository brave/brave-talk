import { DispatchWithoutAction } from "react";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { Button } from "./Button";
import { CopyLinkButton } from "./CopyLinkButton";
import { SectionWithLogo } from "./SectionWithLogo";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";

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
  return (
    <SectionWithLogo
      heading={subscribed === "yes" ? t("talk_title_premium") : t("talk_title")}
      subhead={notice ? t(notice) : t("notice_text")}
    >
      {!hideButtons && (
        <div css={{ display: "flex", flexDirection: "column" }}>
          <Button onClick={onStartCall} disabled={disabled}>
            {subscribed === "yes"
              ? t("Start Premium call")
              : t("Start free call (up to 4 people)")}
          </Button>

          {subscribed === "yes" && !browser.isIOS && <CopyLinkButton />}
        </div>
      )}
    </SectionWithLogo>
  );
};
