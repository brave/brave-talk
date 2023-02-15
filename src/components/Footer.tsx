export const Footer: React.FC = () => {
  return (
    <div
      css={{
        fontWeight: 400,
        fontSize: "12px",
        lineHeight: "18px",
        letterSpacing: "0.01em",
        color: "#ffffff",
        margin: "20px 0 16px",
        a: {
          textDecoration: "underline",
          color: "inherit",
        },
      }}
    >
      <span className="i18n-element-text" id="footer_pre_text">
        Your personal information always stays private, per our{" "}
      </span>
      <a
        href="https://brave.com/privacy/browser/#brave-talk-learn"
        className="i18n-element-text"
        id="footer_pst_text"
      >
        privacy policy
      </a>
      .{" "}
      <a
        href="https://status.brave.com/"
        className="i18n-element-text"
        id="footer_status_text"
      >
        Service status
      </a>
      .
    </div>
  );
};
