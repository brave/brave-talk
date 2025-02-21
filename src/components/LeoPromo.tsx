import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";

const boxStyles = css`
  border-radius: 8px;
  padding: 16px;
  margin: 0 auto 16px;
  box-sizing: border-box;
  text-align: left;
  background: linear-gradient(
    102deg,
    #860ac2 4.73%,
    #e61987 73.23%,
    #ff471a 104.58%
  );
  width: 812px;
  @media only screen and (max-width: 812px) {
    width: 100%;
  }
  a {
    color: white;
  }
  p {
    margin-top: 8px;
    margin-bottom: 0px;
  }
  h2 {
    display: flex;
    align-items: center;
    margin: 0px;
  }
`;

const badgeStyles = css`
  display: inline-block;
  background-color: #e9eeff;
  color: #3f39e8;
  border-radius: 4px;
  padding: 1px 4px;
  margin-left: 8px;
  font-size: 0.7em;
`;

export default function LeoPromo() {
  const { t } = useTranslation();
  return (
    <div css={boxStyles}>
      <h2>
        {t("leo_promo_headline")}
        <span css={badgeStyles}>NEW</span>
      </h2>
      <p>
        {t("leo_promo_description")}&nbsp;
        <a
          href="https://support.brave.com/hc/en-us/articles/25728936518285-How-to-use-Leo-with-Brave-Talk"
          target="_blank"
          rel="noreferrer"
        >
          {t("leo_promo_link_text")}
        </a>
      </p>
    </div>
  );
}
