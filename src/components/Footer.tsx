import { Trans, useTranslation } from "react-i18next";
import { BrowserProperties } from "../hooks/use-browser-properties";

interface Props {
  browser: BrowserProperties;
}

export const Footer = ({ browser }: Props) => {
  const { t } = useTranslation();

  return (
    <footer
      css={{
        width: "min(940px, calc(100% - 40px))",
        margin: "var(--leo-spacing-2xl) auto",
        color: "var(--leo-color-primitive-neutral-90)",
        font: "var(--leo-font-small-regular)",
        textAlign: "center",
        a: {
          textDecoration: "underline",
          color: "inherit",
          textUnderlineOffset: "2px",
        },
      }}
    >
      {browser.isBrave && !browser.isMobile && (
        <>
          <Trans i18nKey="download_extension_footer">
            Download the{" "}
            <a
              href="https://chrome.google.com/webstore/detail/brave-talk-for-google-cal/nimfmkdcckklbkhjjkmbjfcpaiifgamg"
              rel="nofollow noreferrer noopener"
              target="_blank"
            >
              Brave Talk extension for Google Calendar
            </a>
            .
          </Trans>{" "}
        </>
      )}
      <span>{t("footer_pre_text")} </span>
      <a href="https://brave.com/privacy/browser/#brave-talk-learn">
        {t("footer_pst_text")}
      </a>
      . <a href="https://status.brave.app/">{t("footer_status_text")}</a>.
    </footer>
  );
};
