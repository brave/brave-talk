import { css } from "@emotion/react";
import { ReactNode } from "react";

const styles = {
  header: css({
    fontSize: "36px",
    fontWeight: 600,
    lineHeight: "60px",
    color: "#f0f2ff",
  }),
  subhead: css({
    fontWeight: 600,
    fontSize: "15px",
    lineHeight: "20px",
    textAlign: "center",
    letterSpacing: "0.04em",
  }),
  body: css({
    fontWeight: "normal",
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.01em",
  }),
  caption: css({
    fontWeight: 400,
    fontSize: "12px",
    lineHeight: "18px",
    letterSpacing: "0.01em",
    color: "#ffffff",
  }),
  myaccount: css({
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "20px",
    fontStyle: "normal",
  }),
};

interface Props {
  variant: keyof typeof styles;
  children: ReactNode;
  className?: string;
}

export const Text: React.FC<Props> = ({ variant, children, className }) => {
  return (
    <span className={className} css={styles[variant]}>
      {children}
    </span>
  );
};
