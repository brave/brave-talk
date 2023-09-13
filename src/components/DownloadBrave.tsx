import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { SectionWithLogo } from "./SectionWithLogo";
import { Text } from "./Text";

export const DownloadBrave: React.FC = () => {
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
        <div css={{ maxWidth: 377, margin: "0 0 14px" }}>
          <Text variant="body">{t("download_brave_text")}</Text>
        </div>
        <a
          href="https://brave.com/download/bravetalk"
          css={{ textDecoration: "none" }}
        >
          <Button
            css={{
              marginTop: 16,
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
                css={{ marginRight: 12 }}
              />
              <div>{t("welcome_page_button_download_text")}</div>
            </>
          </Button>
        </a>
      </div>
    </SectionWithLogo>
  );
};
