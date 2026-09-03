import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
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
            gap: "var(--leo-spacing-3xl)",
            textAlign: "left",
            "@media only screen and (max-width: 720px)": {
              alignItems: "stretch",
              flexDirection: "column",
              gap: "var(--leo-spacing-2xl)",
            },
          }}
        >
          <div css={{ minWidth: 0, flex: 1 }}>
            <h2
              css={{
                margin:
                  "var(--leo-spacing-none) var(--leo-spacing-none) var(--leo-spacing-m)",
                color: "var(--leo-color-white)",
                font: "var(--leo-font-heading-h2)",
                letterSpacing:
                  "var(--leo-typography-heading-h2-letter-spacing)",
              }}
            >
              {t("recovery_token_title")}
            </h2>
            <p
              css={{
                margin: "var(--leo-spacing-none)",
                color: "var(--leo-color-primitive-neutral-70)",
                font: "var(--leo-font-large-regular)",
                letterSpacing:
                  "var(--leo-typography-large-regular-letter-spacing)",
              }}
            >
              {isPremium
                ? t("recovery_token_description")
                : t("recovery_token_description_free")}{" "}
              <Trans i18nKey="recovery_token_learn_more">
                <a
                  href={RECOVERY_TOKEN_LEARN_MORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  css={{
                    color: "var(--leo-color-primitive-neutral-90)",
                    textUnderlineOffset: "2px",
                  }}
                >
                  Learn more
                </a>
                {"."}
              </Trans>
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
