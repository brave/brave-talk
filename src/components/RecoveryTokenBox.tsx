import { css } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";
import RecoveryTokenDialog from "./RecoveryTokenDialog";

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

export default function RecoveryTokenBox() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Text variant="body">
      <Section>
        <div css={innerStyles}>
          <div css={textStyles}>
            <h2>{t("recovery_token_title")}</h2>
            <p>
              {t("recovery_token_description")}{" "}
              <a href="#" rel="noreferrer">
                {t("recovery_token_learn_more")}
              </a>
              .
            </p>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            {t("recovery_token_manage_button")}
          </Button>
        </div>
      </Section>
      <RecoveryTokenDialog
        key={String(isOpen)}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Text>
  );
}
