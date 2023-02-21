import { ReactNode } from "react";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  children?: ReactNode;
  heading: string;
  subhead: string;
}

export const SectionWithLogo: React.FC<Props> = ({
  children,
  heading,
  subhead,
}) => {
  return (
    <Section css={{ marginTop: 122 }}>
      <div
        css={{
          "--talk-logo-size": "122px",
          backgroundImage: `url(${require("../images/talkLogo.svg")})`,
          backgroundSize: "var(--talk-logo-size) var(--talk-logo-size)",
          width: "var(--talk-logo-size)",
          height: "var(--talk-logo-size)",
          marginTop: "calc(var(--talk-logo-size) / -2)",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div
        css={{
          margin: "0 auto 36px",
          display: "flex",
          flexDirection: "column",
          maxWidth: "calc(100% - 40px)",
          width: "570px",
          zIndex: 2,
          "@media only screen and (max-height: 600px) and (max-width: 600px)": {
            marginBottom: "22px",
          },
        }}
      >
        <h1 css={{ margin: "95px 0 0" }}>
          <Text variant="header">{heading}</Text>
        </h1>
        <p css={{ margin: "8px 0 0" }}>
          <Text variant="subhead">{subhead}</Text>
        </p>
      </div>
      {children}
    </Section>
  );
};
