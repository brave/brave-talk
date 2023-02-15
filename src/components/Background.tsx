import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const Background: React.FC<Props> = ({ children }) => {
  return (
    <div
      css={{
        backgroundImage: `url(${require("../images/background.svg")})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
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
