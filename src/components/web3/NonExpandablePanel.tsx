import { css } from "@emotion/react";
import { ReactNode } from "react";
import { baseText } from "./styles";
import SpinnerImage from "../../images/spinner.svg";

interface Props {
  header: string;
  subhead: string;
  loading?: boolean;
  children?: ReactNode;
}

export const NonExapandablePanel = ({
  header,
  subhead,
  loading = false,
}: Props) => {
  return (
    <div
      css={{
        background: "rgba(255, 255, 255, 0.24)",
        backdropFilter: "blur(8px)",
        marginTop: "11px",
        padding: "24px 19px",
        textAlign: "left",
      }}
    >
      <div
        css={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div css={{ flex: 1 }}>
          <div
            css={css(baseText, {
              fontWeight: 500,
              fontSize: "22px",
              lineHeight: "32px",
            })}
          >
            {header}
          </div>
          <div>{subhead}</div>
        </div>
        {loading && (
          <img width={25} height={26} src={SpinnerImage} alt="spinner" />
        )}
      </div>
    </div>
  );
};
