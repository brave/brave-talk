import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Section } from "./Section";
import RecoveryTokenDialog from "./RecoveryTokenDialog";
import {
  consumePendingRecoveryToken,
  RECOVERY_TOKEN_LEARN_MORE_URL,
} from "../recovery";
import { CONFABS_STORAGE_KEY } from "../jwt-store";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";

interface Props {
  subscribed: SubscriptionStatus;
}

export default function RecoveryTokenBox({ subscribed }: Props) {
  const { t } = useTranslation();
  const [initialToken, setInitialToken] = useState(() =>
    consumePendingRecoveryToken(),
  );
  const [isOpen, setIsOpen] = useState(initialToken !== null);
  const [hasConfabs] = useState(
    () => window.localStorage.getItem(CONFABS_STORAGE_KEY) !== null,
  );

  const handleClose = () => {
    setIsOpen(false);
    setInitialToken(null);
  };

  const isPremium = subscribed === "yes";
  const showBox = isPremium || (subscribed === "no" && !hasConfabs);

  return (
    <>
      {showBox && (
        <Section
          css={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            textAlign: "left",
            "@media only screen and (max-width: 720px)": {
              alignItems: "stretch",
              flexDirection: "column",
              gap: "24px",
            },
          }}
        >
          <div css={{ minWidth: 0, flex: 1 }}>
            <h2
              css={{
                margin: "0 0 8px",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "22px",
                lineHeight: "28px",
                letterSpacing: "-0.5px",
              }}
            >
              {t("recovery_token_title")}
            </h2>
            <p
              css={{
                margin: 0,
                color: "#aaaaad",
                fontSize: "16px",
                lineHeight: "24px",
                letterSpacing: "-0.23px",
              }}
            >
              {isPremium
                ? t("recovery_token_description")
                : t("recovery_token_description_free")}{" "}
              <a
                href={RECOVERY_TOKEN_LEARN_MORE_URL}
                target="_blank"
                rel="noreferrer"
                css={{ color: "inherit", textUnderlineOffset: "2px" }}
              >
                {t("recovery_token_learn_more")}
              </a>
            </p>
          </div>
          <div css={{ flexShrink: 0 }}>
            <Button
              variant="outline"
              size="large"
              onClick={() => setIsOpen(true)}
              css={{
                "@media only screen and (max-width: 720px)": {
                  width: "100%",
                },
              }}
            >
              {t("recovery_token_manage_button")}
            </Button>
          </div>
        </Section>
      )}
      <RecoveryTokenDialog
        key={String(isOpen)}
        isOpen={isOpen}
        onClose={handleClose}
        initialToken={initialToken}
        hasConfabs={hasConfabs}
      />
    </>
  );
}
