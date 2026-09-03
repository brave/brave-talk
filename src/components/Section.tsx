import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}
export const Section = ({ children, className }: Props) => (
  <div
    css={{
      width: "min(940px, 100%)",
      padding: "32px",
      margin: "0 auto 40px",
      background: "rgba(20, 20, 21, 0.94)",
      border: "1px solid #252527",
      borderRadius: "24px",
      "@media only screen and (max-width: 600px)": {
        padding: "24px",
        marginBottom: "16px",
      },
    }}
    className={className}
  >
    {children}
  </div>
);
