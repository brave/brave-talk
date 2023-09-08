import { css } from "@emotion/react";

export const Divider = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500px"
      height="1"
      viewBox="0 0 500 1"
      fill="none"
      css={css`
        display: flex;
        height: 1px;
        justify-content: center;
        align-items: center;
        align-self: stretch;
      `}
    >
      <rect width="500" height="1" fill="#A1ABBA" />
    </svg>
  );
};
