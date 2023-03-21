import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}
export const Section: React.FC<Props> = ({ children, className }) => (
  <div
    css={{
      width: "812px",
      paddingBottom: "36px",
      paddingLeft: "24px",
      paddingRight: "24px",
      margin: "0 auto 16px",
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(32px)",
      borderRadius: "24px",
      "@media only screen and (max-width: 812px)": {
        width: "100%",
      },
    }}
    className={className}
  >
    {children}
  </div>
);
