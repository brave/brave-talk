import { css } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";
import RecoveryTokenDialog from "./RecoveryTokenDialog";
import {
  consumePendingRecoveryToken,
  RECOVERY_TOKEN_LEARN_MORE_URL,
} from "../recovery";
import { CONFABS_STORAGE_KEY } from "../jwt-store";
import { SubscriptionStatus } from "../hooks/use-subscribed-status";

const innerStyles = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--leo-spacing-2xl);
  padding: var(--leo-spacing-xl) var(--leo-spacing-m);
  margin-bottom: calc(-1 * var(--leo-spacing-2xl));
  h2 {
    text-align: left;
    font-size: 1.5em;
    margin-bottom: var(--leo-spacing-m);
  }
  p {
    text-align: left;
    margin: 0;
  }
  a {
    color: inherit;
  }
  button {
    flex-shrink: 0;
    width: auto;
  }
`;

const textStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--leo-spacing-s);
`;

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
        <Text variant="body">
          <Section>
            <div css={innerStyles}>
              <div css={textStyles}>
                <h2>{t("recovery_token_title")}</h2>
                <p>
                  {isPremium
                    ? t("recovery_token_description")
                    : t("recovery_token_description_free")}{" "}
                  <a
                    href={RECOVERY_TOKEN_LEARN_MORE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("recovery_token_learn_more")}
                  </a>
                </p>
              </div>
              <Button onClick={() => setIsOpen(true)}>
                {t("recovery_token_manage_button")}
              </Button>
            </div>
          </Section>
        </Text>
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
