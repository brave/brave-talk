import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}
export const Section = ({ children, className }: Props) => (
  <div
    css={{
      width: "min(940px, 100%)",
      padding: "var(--leo-spacing-3xl)",
      margin: "var(--leo-spacing-none) auto var(--leo-spacing-4xl)",
      background:
        "color-mix(in srgb, var(--leo-color-primitive-neutral-5) 94%, transparent)",
      border:
        "calc(var(--leo-spacing-xs) / 2) solid var(--leo-color-primitive-neutral-15)",
      borderRadius: "var(--leo-radius-xxl)",
      a: {
        color: "var(--leo-color-primitive-neutral-80)",
      },
      "@media only screen and (max-width: 600px)": {
        padding: "var(--leo-spacing-2xl)",
        marginBottom: "var(--leo-spacing-xl)",
      },
    }}
    className={className}
  >
    {children}
  </div>
);
