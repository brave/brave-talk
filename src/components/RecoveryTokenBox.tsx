import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";

const innerStyles = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  padding: 18px 8px 16px 8px;
  margin-bottom: -24px;
  h2 {
    text-align: left;
    font-size: 1.5em;
    margin-bottom: 8px;
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
  gap: 2px;
`;

export default function RecoveryTokenBox() {
  const { t } = useTranslation();
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
          <Button>{t("recovery_token_manage_button")}</Button>
        </div>
      </Section>
    </Text>
  );
}
