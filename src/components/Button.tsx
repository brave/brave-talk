import { css } from "@emotion/react";
import { DispatchWithoutAction, ReactNode } from "react";

interface Props {
  hollow?: boolean;
  onClick?: DispatchWithoutAction;
  children: ReactNode;
}

const styles = {
  button: css({
    margin: "0 auto",
    width: "377px",
    background: "rgba(255, 255, 255, 0.24)",
    backdropFilter: "blur(16px)",
    borderRadius: "48px",
    padding: "17px 30px 19px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "20px",
    color: "#ffffff",
    "&:hover": { background: "rgba(255, 255, 255, 0.42)" },
    "&:active": { background: "rgba(255, 255, 255, 0.32)" },
    "&:disabled": { background: "rgba(255, 255, 255, 0.32)" },
  }),
  hollow: css({
    margin: "0 auto",
    width: 377,
    height: 58,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "48px",
    padding: "17px 30px 19px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "20px",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    background: "transparent",
    "&:hover": { border: "2px solid #ffffff" },
    "&:active": {
      border: "2px solid rgba(255, 255, 255, 0.5)",
      color: "rgba(255, 255, 255, 0.5)",
    },
    "& a": { textDecoration: "none", color: "inherit" },
  }),
};

export const Button: React.FC<Props> = ({ hollow, children, onClick }) => {
  return (
    <button css={hollow ? styles.hollow : styles.button} onClick={onClick}>
      {children}
    </button>
  );
};
