import { ReactNode } from "react";

interface Props {
  variant: "header" | "subhead" | "body" | "caption";
  children: ReactNode;
}

export const Text: React.FC<Props> = ({ variant, children }) => {
  return <span>{children}</span>;
};
