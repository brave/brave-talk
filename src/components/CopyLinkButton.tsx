import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { generateRoomName, wait } from "../lib";
import { fetchJWT } from "../rooms";
import { Button } from "./Button";

export const CopyLinkButton: React.FC = () => {
  const [buttonText, setButtonText] = useState<TranslationKeys>();
  const { t } = useTranslation();

  const onCopyLink = async () => {
    const roomName = generateRoomName();
    const { url } = await fetchJWT(roomName, true, setButtonText);

    if (!url) {
      setButtonText("Failed to create meeting room");
    } else {
      const absoluteUrl = new URL(url, window.location.href);
      await window.navigator.clipboard.writeText(absoluteUrl.href);

      setButtonText("Link copied to clipboard");
    }

    await wait(5_000);
    setButtonText(undefined);
  };

  return (
    <Button
      onClick={onCopyLink}
      css={{
        marginTop: 16,
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
      }}
      disabled={!!buttonText}
    >
      {buttonText ? (
        t(buttonText)
      ) : (
        <>
          <img
            src={require("../images/link_icon.svg")}
            alt="link"
            width="22"
            height="22"
            css={{ marginRight: 6 }}
          />
          <div>{t("create_link")}</div>
        </>
      )}
    </Button>
  );
};
