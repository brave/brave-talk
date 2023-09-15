import { ReactNode } from "react";
interface Props {
  children: ReactNode;
}

export const Background = ({ children }: Props) => {
  return (
    <div
      css={{
        backgroundImage: `url(${require("../images/background.svg")})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
      }}
    >
      {children}
    </div>
  );
};
