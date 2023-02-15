import { Text } from "./Text";

export const Footer: React.FC = () => {
  return (
    <div
      css={{
        margin: "20px 0 16px",
        a: {
          textDecoration: "underline",
          color: "inherit",
        },
      }}
    >
      <Text variant="caption">
        <span>Your personal information always stays private, per our </span>
        <a href="https://brave.com/privacy/browser/#brave-talk-learn">
          privacy policy
        </a>
        . <a href="https://status.brave.com/">Service status</a>.
      </Text>
    </div>
  );
};
