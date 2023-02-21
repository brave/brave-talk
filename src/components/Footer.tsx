import { BrowserProperties } from "../rules";
import { Text } from "./Text";

interface Props {
  browser: BrowserProperties;
}

export const Footer: React.FC<Props> = ({ browser }) => {
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
        {browser.isBrave && !browser.isMobile && (
          <div>
            Download the{" "}
            <a
              href="https://chrome.google.com/webstore/detail/brave-talk-for-google-cal/nimfmkdcckklbkhjjkmbjfcpaiifgamg"
              rel="nofollow noreferrer noopener"
              target="_blank"
            >
              Google Calendar extension
            </a>
            .
          </div>
        )}
        <div>
          <span>Your personal information always stays private, per our </span>
          <a href="https://brave.com/privacy/browser/#brave-talk-learn">
            privacy policy
          </a>
          . <a href="https://status.brave.com/">Service status</a>.
        </div>
      </Text>
    </div>
  );
};
