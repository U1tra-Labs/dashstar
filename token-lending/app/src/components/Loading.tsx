import styled from "@emotion/styled";
import React, { useMemo } from "react";

export default function Loading({
  borderColor = "#ffffff",
  borderWidth = "4px",
  size = "64px",
}: {
  borderColor?: string;
  borderWidth?: string;
  size?: string;
}) {
  const innerDivStyle = useMemo<React.CSSProperties>(() => {
    return { borderColor, borderWidth };
  }, [borderColor, borderWidth]);

  return (
    <RippleContainer>
      <Ripple style={{ height: size, width: size }}>
        <Ring style={innerDivStyle} />
        <Ring style={innerDivStyle} />
      </Ripple>
    </RippleContainer>
  );
}

const Ring = styled.div`
  border-style: solid;
`;

const RippleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
`;

const Ripple = styled.div`
  position: relative;
  div {
    position: absolute;
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  div:nth-child(2) {
    animation-delay: -0.5s;
  }

  @keyframes lds-ripple {
    0% {
      top: 28px;
      left: 28px;
      width: 0;
      height: 0;
      opacity: 1;
    }

    100% {
      top: -1px;
      left: -1px;
      width: 58px;
      height: 58px;
      opacity: 0;
    }
  }
`;
