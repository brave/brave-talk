import { ReactNode } from "react";
import { Section } from "./Section";
import { Text } from "./Text";

interface Props {
  children?: ReactNode;
  heading: string;
  subhead: string;
}

export const SectionWithLogo = ({ children, heading, subhead }: Props) => {
  return (
    <Section
      css={{
        marginTop:
          "calc(var(--leo-spacing-8xl) + var(--leo-spacing-2xl) + var(--leo-spacing-xs))",
      }}
    >
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
          margin:
            "var(--leo-spacing-none) auto calc(var(--leo-spacing-3xl) + var(--leo-spacing-s))",
          display: "flex",
          flexDirection: "column",
          maxWidth: "calc(100% - 40px)",
          width: "570px",
          zIndex: 2,
          "@media only screen and (max-height: 600px) and (max-width: 600px)": {
            marginBottom:
              "calc(var(--leo-spacing-xl) + var(--leo-spacing-s) + var(--leo-spacing-xs))",
          },
        }}
      >
        <h1
          css={{
            margin:
              "calc(var(--leo-spacing-8xl) - var(--leo-spacing-xs) / 2) var(--leo-spacing-none) var(--leo-spacing-none)",
          }}
        >
          <Text variant="header">{heading}</Text>
        </h1>
        <p
          css={{
            margin:
              "var(--leo-spacing-m) var(--leo-spacing-none) var(--leo-spacing-none)",
          }}
        >
          <Text variant="subhead">{subhead}</Text>
        </p>
      </div>
      {children}
    </Section>
  );
};
