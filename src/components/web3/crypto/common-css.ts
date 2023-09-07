import { keyframes, css } from "@emotion/react";

export const fadeInAnim = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(-20px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
`;

export const popupBaseCSS = css`
  position: absolute;
  border-radius: var(--radius-xl, 8px);
  border: 1px solid var(--semantic-border-color, #e5e5e5);
  border-radius: 8px;
  background: var(--semantic-container-background, #fff);
  display: flex;
  width: 500px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  background-color: #ffffff;
  color: #000000;
  z-index: 99999;
  animation: ease-in-out 0.5s ${fadeInAnim};
`;

export const popupHeaderCSS = css`
  display: flex;
  height: 56px;
  padding: 8px 16px 8px 24px;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
`;

export const actionsCSS = css`
  display: flex;
  padding: 20px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--spacing-xl, 16px);
  align-self: stretch;
`;

export const buttonCSS = css`
  width: 150px;
  height: 44px;
  margin-right: 16px;
  margin-left: 16px;
  border-radius: 22px;
  background-color: #3f39e8;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  flex: 1 0 0;
`;

export const popupContentCSS = css`
  padding: 20px;
  font-size: 16px;
`;

export const highlightBoxCSS = css`
  border-radius: 4px;
  background: #e9eeff;
  padding: 16px;
`;
