import { Dispatch } from "react";
import { Button } from "../Button";
import { Section } from "../Section";
import { Text } from "../Text";

interface Props {
  onClick: Dispatch<void>;
  isSubscribed: boolean;
}

export const Web3CTA: React.FC<Props> = ({ onClick, isSubscribed }) => {
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
          {isSubscribed ? (
            <>Host a Web3 Call</>
          ) : (
            <>Signup to host a Web3 Call</>
          )}
        </Button>
        {!isSubscribed && (
          <p>
            A Brave Talk Premium account is required in order to host Web3
            calls. Start your free trial now.
          </p>
        )}
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
