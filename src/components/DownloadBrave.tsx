import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { SectionWithLogo } from "./SectionWithLogo";
import { Text } from "./Text";

export const DownloadBrave = () => {
  const { t } = useTranslation();

  return (
    <SectionWithLogo
      heading={t("talk_title")}
      subhead={t(
        "Unlimited private video calls, right in your browser. No app required.",
      )}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          css={{
            maxWidth: 377,
            margin:
              "var(--leo-spacing-none) var(--leo-spacing-none) calc(var(--leo-spacing-l) + var(--leo-spacing-xs))",
          }}
        >
          <Text variant="body">{t("download_brave_text")}</Text>
        </div>
        <a
          href="https://brave.com/download/bravetalk"
          css={{ textDecoration: "none" }}
        >
          <Button
            css={{
              marginTop: "var(--leo-spacing-xl)",
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <>
              <img
                src={require("../images/brave_icon.svg")}
                alt="brave logo"
                width="22"
                height="22"
                css={{ marginRight: "var(--leo-spacing-l)" }}
              />
              <div>{t("welcome_page_button_download_text")}</div>
            </>
          </Button>
        </a>
      </div>
    </SectionWithLogo>
  );
};
