import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "../i18n/i18next";
import { generateRoomName, wait } from "../lib";
import { fetchJWT } from "../rooms";
import { Button } from "./Button";

export const CopyLinkButton = () => {
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
      variant="light"
      size="large"
      onClick={onCopyLink}
      css={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--leo-spacing-s)",
      }}
      disabled={!!buttonText}
    >
      {buttonText ? (
        t(buttonText)
      ) : (
        <>
          <img
            src={require("../images/link-normal.svg")}
            alt=""
            width="24"
            height="24"
          />
          <div>{t("create_link")}</div>
        </>
      )}
    </Button>
  );
};
