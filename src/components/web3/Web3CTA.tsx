import { Dispatch } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Button } from "../Button";
import { Section } from "../Section";
import { Text } from "../Text";
import { resolveService } from "../../services";

interface Props {
  onClick: Dispatch<void>;
  isSubscribed: boolean;
}

export const Web3CTA: React.FC<Props> = ({ onClick, isSubscribed }) => {
  const { t } = useTranslation();
  return (
    <Section
      css={{
        marginTop: "16px",
        padding: "16px 16px 16px",
      }}
    >
      <Text variant="body">
        <p css={{ margin: "8px auto 18px", maxWidth: "500px" }}>
          {t("host_web3_call_body")}
        </p>
        <Button hollow onClick={onClick}>
          {isSubscribed ? t("host_web3_button") : t("web3_sign_up_button")}
        </Button>
        {!isSubscribed && (
          <Trans i18nKey="web3_premium_trial">
            <p>
              Brave Talk premium subscription required for Web3 calls. Already
              have Premium?{" "}
              <a href={resolveService("account")} style={{ color: "inherit" }}>
                Log in
              </a>
              .
            </p>
          </Trans>
        )}
        <p>
          <a
            href="https://brave.com/web3/what-is-web3/"
            css={{ color: "inherit" }}
          >
            {t("web3_cta_fine_print")}
          </a>
        </p>
      </Text>
    </Section>
  );
};
