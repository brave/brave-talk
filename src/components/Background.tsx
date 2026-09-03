import { ReactNode } from "react";
interface Props {
  children: ReactNode;
}

export const Background = ({ children }: Props) => {
  return (
    <div
      css={{
        backgroundColor: "#000000",
        backgroundImage: `url(${require("../images/homepage/background.svg")})`,
        backgroundPosition: "center",
        backgroundRepeat: "repeat-y",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100dvh",
        overflowX: "hidden",
        overflowY: "auto",
        "@media only screen and (max-width: 600px)": {
          backgroundImage: "none",
        },
      }}
    >
      {children}
    </div>
  );
};
