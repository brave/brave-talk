import { css, Global } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css({
      "*,*:before,*:after": { boxSizing: "inherit", textWrap: "pretty" },
      "input,textarea": {
        userSelect: "text",
      },
      html: {
        height: "100%",
        width: "100%",
        textAlign: "center",
        background: "var(--leo-color-black)",
        boxSizing: "border-box",
      },
      body: {
        margin: "var(--leo-spacing-none) auto",
        height: "100%",
        width: "100%",
        font: "var(--leo-font-small-regular)",
        color: "var(--leo-color-primitive-neutral-95)",
        overflow: "hidden",
      },
      "#root": {
        height: "100%",
      },
      button: {
        border: "none",
        font: "inherit",
      },
      iframe: {
        position: "absolute",
        top: "0px",
        left: "0px",
      },
    })}
  />
);
