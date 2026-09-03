import { css } from "@emotion/react";
import { DispatchWithoutAction, ReactNode } from "react";

interface Props {
  hollow?: boolean;
  variant?: "default" | "light" | "hero" | "outline" | "plain";
  size?: "default" | "large" | "jumbo";
  onClick?: DispatchWithoutAction;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

const styles = {
  base: css({
    margin: "var(--leo-spacing-none) auto",
    width: "min(377px, 100%)",
    borderRadius: "var(--leo-radius-full)",
    padding:
      "calc(var(--leo-spacing-xl) + var(--leo-spacing-xs) / 2) calc(var(--leo-spacing-3xl) - var(--leo-spacing-xs)) calc(var(--leo-spacing-xl) + var(--leo-spacing-s) - var(--leo-spacing-xs) / 2)",
    cursor: "pointer",
    font: "var(--leo-font-components-button-large)",
    color: "var(--leo-color-white)",
    textDecoration: "none",
    "@media only screen and (max-width: 600px)": {
      width: "100%",
    },
    "&:disabled": {
      cursor: "wait",
      opacity: 0.65,
    },
  }),
  solid: css({
    background: "color-mix(in srgb, var(--leo-color-white) 24%, transparent)",
    "&:hover": {
      background: "color-mix(in srgb, var(--leo-color-white) 42%, transparent)",
    },
    "&:active": {
      background: "color-mix(in srgb, var(--leo-color-white) 32%, transparent)",
    },
    "&:disabled": {
      background: "color-mix(in srgb, var(--leo-color-white) 32%, transparent)",
    },
  }),
  hollow: css({
    height: 58,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border:
      "1px solid color-mix(in srgb, var(--leo-color-white) 80%, transparent)",
    background: "transparent",
    "&:hover": { border: "2px solid var(--leo-color-white)" },
    "&:active": {
      border:
        "2px solid color-mix(in srgb, var(--leo-color-white) 50%, transparent)",
      color: "color-mix(in srgb, var(--leo-color-white) 50%, transparent)",
    },
    "& a": { textDecoration: "none", color: "inherit" },
  }),
  light: css({
    background: "var(--leo-color-primitive-neutral-96)",
    color: "var(--leo-color-primitive-neutral-8)",
    "&:hover": { background: "var(--leo-color-white)" },
    "&:active": { background: "var(--leo-color-primitive-neutral-90)" },
  }),
  hero: css({
    background:
      "linear-gradient(0deg, var(--leo-color-primitive-brands-rorange-3) 0%, var(--leo-color-primitive-brands-rorange-1) 100%)",
    color: "var(--leo-color-white)",
    boxShadow:
      "0 6px 20px color-mix(in srgb, var(--leo-color-primitive-brands-rorange-2) 18%, transparent)",
    "&:hover": {
      background:
        "linear-gradient(0deg, color-mix(in srgb, var(--leo-color-primitive-brands-rorange-3) 85%, var(--leo-color-white)) 0%, color-mix(in srgb, var(--leo-color-primitive-brands-rorange-1) 85%, var(--leo-color-white)) 100%)",
    },
    "&:active": {
      background:
        "linear-gradient(0deg, color-mix(in srgb, var(--leo-color-primitive-brands-rorange-3) 90%, var(--leo-color-black)) 0%, color-mix(in srgb, var(--leo-color-primitive-brands-rorange-1) 90%, var(--leo-color-black)) 100%)",
    },
  }),
  outline: css({
    background: "transparent",
    color: "var(--leo-color-white)",
    boxShadow: "inset 0 0 0 1px var(--leo-color-primitive-neutral-30)",
    "&:hover": {
      background: "color-mix(in srgb, var(--leo-color-white) 8%, transparent)",
    },
    "&:active": {
      background: "color-mix(in srgb, var(--leo-color-white) 12%, transparent)",
    },
  }),
  plain: css({
    width: "auto",
    padding: "var(--leo-spacing-m) var(--leo-spacing-l)",
    background: "transparent",
    color: "var(--leo-color-white)",
    "&:hover": {
      background: "color-mix(in srgb, var(--leo-color-white) 8%, transparent)",
    },
  }),
  large: css({
    width: "auto",
    padding:
      "calc(var(--leo-spacing-l) + var(--leo-spacing-xs)) var(--leo-spacing-2xl)",
    font: "var(--leo-font-components-button-large)",
    letterSpacing:
      "var(--leo-typography-components-button-large-letter-spacing)",
  }),
  jumbo: css({
    width: "100%",
    padding:
      "calc(var(--leo-spacing-l) + var(--leo-spacing-xs)) var(--leo-spacing-2xl)",
    font: "var(--leo-font-large-semibold)",
  }),
};

export const Button = ({
  hollow,
  variant = "default",
  size = "default",
  children,
  onClick,
  disabled,
  className,
}: Props) => {
  return (
    <button
      css={[
        styles.base,
        hollow
          ? styles.hollow
          : variant === "default"
            ? styles.solid
            : styles[variant],
        size !== "default" && styles[size],
      ]}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};
