import { Dispatch } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { Section } from "../Section";
import { Text } from "../Text";

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
          Create a Web3 video call with token-gated access controls. Select an
          unique NFT avatar, assign moderator privileges using POAPs, and more.
        </p>
        <Button hollow onClick={onClick}>
          {isSubscribed ? t("host_web3_button") : t("web3_sign_up_button")}
        </Button>
        {!isSubscribed && <p>{t("web3_premium_trial")}</p>}
        <p>
          <a
            href="https://brave.com/web3/what-is-web3/"
            css={{ color: "inherit" }}
          >
            Learn more about Web3 calls with Brave Talk
          </a>
        </p>
      </Text>
    </Section>
  );
};
