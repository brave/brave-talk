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
    transition: "var(--transition-interactive)",
    font: "var(--leo-font-components-button-large)",
    color: "var(--leo-color-white)",
    textDecoration: "none",
    "@media only screen and (max-width: 600px)": {
      width: "100%",
    },
    "&:active:not(:disabled)": {
      transform: "scale(var(--scale-pressed))",
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
    // The base transition covers border-color, but this variant also thickens
    // its border on hover, which would otherwise snap.
    transition: "border-width 0.12s ease-in-out, var(--transition-interactive)",
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
    background: "var(--leo-color-primitive-neutral-95)",
    color: "var(--leo-color-primitive-neutral-5)",
    "&:hover": { background: "var(--leo-color-white)" },
    "&:active": { background: "var(--leo-color-primitive-neutral-90)" },
  }),
  hero: css({
    position: "relative",
    zIndex: 0,
    background:
      "linear-gradient(0deg, var(--leo-color-primitive-brands-rorange-3) 0%, var(--leo-color-primitive-brands-rorange-1) 100%)",
    color: "var(--leo-color-white)",
    boxShadow:
      "0 6px 20px color-mix(in srgb, var(--leo-color-primitive-brands-rorange-2) 18%, transparent)",
    // Gradients cannot be transitioned, so leo-button crossfades gradient
    // states through layers instead. White at 15% and black at 10% render the
    // same as the 85%/90% color-mix these states applied to the gradient.
    "&::before,&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: -1,
      borderRadius: "inherit",
      opacity: 0,
      transition: "var(--transition-interactive)",
    },
    "&::before": { background: "var(--leo-color-white)" },
    "&::after": { background: "var(--leo-color-black)" },
    "&:hover::before": { opacity: 0.15 },
    "&:active::before": { opacity: 0 },
    "&:active::after": { opacity: 0.1 },
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
    minHeight: "52px",
    padding: "var(--leo-spacing-l) var(--leo-spacing-xl)",
    font: "var(--leo-font-components-button-large)",
    letterSpacing:
      "var(--leo-typography-components-button-large-letter-spacing)",
  }),
  jumbo: css({
    width: "100%",
    minHeight: "60px",
    padding: "var(--leo-spacing-xl)",
    font: "var(--leo-font-components-button-jumbo)",
    letterSpacing:
      "var(--leo-typography-components-button-jumbo-letter-spacing)",
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
