import { css, Global } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css({
      ":root": {
        // Leo has no motion tokens, so this mirrors the transition leo-button
        // applies to its own hover and pressed states. Transform is ours:
        // leo-button signals a press with opacity rather than a scale.
        "--transition-interactive":
          "background 0.12s ease-in-out, box-shadow 0.12s ease-in-out, color 0.12s ease-in-out, border-color 0.12s ease-in-out, opacity 0.12s ease-in-out, transform 0.12s ease-in-out",
        "--scale-pressed": "0.97",
      },
      "@media (prefers-reduced-motion: reduce)": {
        ":root": {
          "--transition-interactive": "none",
          "--scale-pressed": "1",
        },
      },
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
