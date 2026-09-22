import { css } from "@emotion/react";
import { ReactNode } from "react";

const styles = {
  header: css({
    font: "var(--leo-font-heading-display3)",
    color: "var(--leo-color-primitive-primary-95)",
  }),
  subhead: css({
    font: "var(--leo-font-default-semibold)",
    textAlign: "center",
    letterSpacing: "var(--leo-typography-default-semibold-letter-spacing)",
  }),
  "secondary-section-head": css({
    font: "var(--leo-font-heading-h2)",
    textAlign: "center",
    letterSpacing: "var(--leo-typography-heading-h2-letter-spacing)",
  }),
  body: css({
    font: "var(--leo-font-default-regular)",
    letterSpacing: "var(--leo-typography-default-regular-letter-spacing)",
  }),
  caption: css({
    font: "var(--leo-font-small-regular)",
    letterSpacing: "var(--leo-typography-small-regular-letter-spacing)",
    color: "var(--leo-color-white)",
  }),
};

interface Props {
  variant: keyof typeof styles;
  children: ReactNode;
  className?: string;
}

export const Text = ({ variant, children, className }: Props) => {
  return (
    <span className={className} css={styles[variant]}>
      {children}
    </span>
  );
};
