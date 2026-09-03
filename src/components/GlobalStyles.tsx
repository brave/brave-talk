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
        background: "#000000",
        boxSizing: "border-box",
      },
      body: {
        margin: "0 auto",
        height: "100%",
        width: "100%",
        fontSize: "12px",
        fontWeight: "normal",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#f1f1f1",
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
