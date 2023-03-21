import { Trans, useTranslation } from "react-i18next";
import { BrowserProperties } from "../hooks/use-browser-properties";
import { Text } from "./Text";

interface Props {
  browser: BrowserProperties;
}

export const Footer: React.FC<Props> = ({ browser }) => {
  const { t } = useTranslation();

  return (
    <div
      css={{
        margin: "20px 0 16px",
        a: {
          textDecoration: "underline",
          color: "inherit",
        },
      }}
    >
      <Text variant="caption">
        {browser.isBrave && !browser.isMobile && (
          <Trans i18nKey="download_extension_footer">
            Download the{" "}
            <a
              href="https://chrome.google.com/webstore/detail/brave-talk-for-google-cal/nimfmkdcckklbkhjjkmbjfcpaiifgamg"
              rel="nofollow noreferrer noopener"
              target="_blank"
            >
              Google Calendar extension
            </a>
            .
          </Trans>
        )}
        <div>
          <span>{t("footer_pre_text")} </span>
          <a href="https://brave.com/privacy/browser/#brave-talk-learn">
            {t("footer_pst_text")}
          </a>
          . <a href="https://status.brave.com/">{t("footer_status_text")}</a>.
        </div>
      </Text>
    </div>
  );
};
