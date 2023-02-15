import { css } from "@emotion/react";
import { DispatchWithoutAction } from "react";

interface Props {
  outlined?: boolean;
  label: string;
  onClick?: DispatchWithoutAction;
}

const styles = {
  button: css({
    margin: "0 auto",
    width: "377px",
    background: "rgba(255, 255, 255, 0.24)",
    backdropFilter: "blur(16px)",
    borderRadius: "48px",
    border: "none",
    padding: "17px 30px 19px",
    textAlign: "center",
    verticalAlign: "middle",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "20px",
    color: "#ffffff",
    "&:hover": { background: "rgba(255, 255, 255, 0.42)" },
    "&:active": { background: "rgba(255, 255, 255, 0.32)" },
    "&:disabled": { background: "rgba(255, 255, 255, 0.32)" },
  }),
};

export const Button: React.FC<Props> = ({ outlined, label, onClick }) => {
  return (
    <button css={styles.button} onClick={onClick}>
      {label}
    </button>
  );
};
