import { css, keyframes } from "@emotion/react";
import { useEffect, useRef, useState } from "react";

const arrowAnimation = keyframes`
  0% {
    opacity: 0;
    transform: rotate(45deg) translate(-20px, -20px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(45deg) translate(20px, 20px);
  }
`;

const arrowCSS = css`
  position: absolute;
  bottom: 57%;
  transform: translate(-50%, -50%) rotate(-90deg);
  cursor: pointer;

  span {
    display: block;
    width: 14px;
    height: 14px;
    margin: -10px;
    transform: rotate(45deg);
    border-bottom: 5px solid #3f39e8;
    border-right: 5px solid #3f39e8;
    animation: ${arrowAnimation} 2s infinite;
  }

  span:nth-child(2) {
    animation-delay: -0.2s;
  }

  span:nth-child(3) {
    animation-delay: -0.4s;
  }
`;

export const AnimatedArrow: React.FC = () => {
  return (
    <span css={{ width: "80px", marginRight: "10px", display: "inline-block" }}>
      <span css={arrowCSS}>
        <span></span>
        <span></span>
        <span></span>
      </span>
    </span>
  );
};
