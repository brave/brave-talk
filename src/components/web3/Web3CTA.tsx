import { Dispatch } from "react";
import { Button } from "../Button";
import { Section } from "../Section";
import { Text } from "../Text";

interface Props {
  onClick: Dispatch<void>;
}

export const Web3CTA: React.FC<Props> = ({ onClick }) => {
  return (
    <Section
      css={{
        marginTop: "16px",
        padding: "16px 16px 16px",
      }}
    >
      <Text variant="body">
        <p css={{ margin: "8px auto 18px", maxWidth: "500px" }}>
          Create a Brave Talk call that allows you to select a unique NFT
          avatar, assign moderator privileges using POAPs, and more.
        </p>
        <Button hollow onClick={onClick}>
          Start a Web3 Call
        </Button>
        <p>
          <a
            href="https://brave.com/web3/what-is-web3/"
            css={{ color: "inherit" }}
          >
            What is Web3?
          </a>
        </p>
      </Text>
    </Section>
  );
};
