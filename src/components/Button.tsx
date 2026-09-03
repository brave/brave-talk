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
    margin: "0 auto",
    width: "min(377px, 100%)",
    borderRadius: "48px",
    padding: "17px 30px 19px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "20px",
    color: "#ffffff",
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
    background: "rgba(255, 255, 255, 0.24)",
    "&:hover": { background: "rgba(255, 255, 255, 0.42)" },
    "&:active": { background: "rgba(255, 255, 255, 0.32)" },
    "&:disabled": { background: "rgba(255, 255, 255, 0.32)" },
  }),
  hollow: css({
    height: 58,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    background: "transparent",
    "&:hover": { border: "2px solid #ffffff" },
    "&:active": {
      border: "2px solid rgba(255, 255, 255, 0.5)",
      color: "rgba(255, 255, 255, 0.5)",
    },
    "& a": { textDecoration: "none", color: "inherit" },
  }),
  light: css({
    background: "#f5f5f7",
    color: "#171719",
    "&:hover": { background: "#ffffff" },
    "&:active": { background: "#dedee1" },
  }),
  hero: css({
    background: "linear-gradient(135deg, #ff5601 0%, #ff1f01 100%)",
    color: "#ffffff",
    boxShadow: "0 6px 20px rgba(255, 50, 1, 0.18)",
    "&:hover": {
      background: "linear-gradient(135deg, #ff6a1a 0%, #ff3216 100%)",
    },
    "&:active": {
      background: "linear-gradient(135deg, #e94c00 0%, #e51b00 100%)",
    },
  }),
  outline: css({
    background: "transparent",
    color: "#ffffff",
    boxShadow: "inset 0 0 0 1px #464649",
    "&:hover": { background: "rgba(255, 255, 255, 0.08)" },
    "&:active": { background: "rgba(255, 255, 255, 0.12)" },
  }),
  plain: css({
    width: "auto",
    padding: "8px 12px",
    background: "transparent",
    color: "#ffffff",
    "&:hover": { background: "rgba(255, 255, 255, 0.08)" },
  }),
  large: css({
    width: "auto",
    padding: "14px 24px",
    fontSize: "16px",
    lineHeight: "22px",
    letterSpacing: "-0.4px",
  }),
  jumbo: css({
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    lineHeight: "24px",
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
