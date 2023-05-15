import { css, Global } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css({
      "*": { userSelect: "none" },
      "*,*:before,*:after": { boxSizing: "inherit" },
      "input,textarea": {
        userSelect: "text",
      },
      html: {
        width: "100%",
        textAlign: "center",
        background: "#3900b8",
        boxSizing: "border-box",
      },
      body: {
        margin: "0 auto",
        width: "100%",
        fontSize: "12px",
        fontWeight: 400,
        fontFamily: '"Poppins", "Open Sans Pro", Arial, sans-serif',
        color: "#f1f1f1",
        overflow: "hidden",
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
