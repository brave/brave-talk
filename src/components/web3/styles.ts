import { css } from "@emotion/react";

// TODO: we should use the Text component instead of these styles

export const baseText = css({
  fontFamily: "Poppins",
  fontStyle: "normal",
});

export const header = css(baseText, {
  fontWeight: 600,
  fontSize: "36px",
  lineHeight: "60px",
  color: "#FFFFFF",
});

export const bodyText = css(baseText, {
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: "#E2E3E7",
});

export const walletAddress = css(baseText, {
  wordWrap: "break-word",
});
