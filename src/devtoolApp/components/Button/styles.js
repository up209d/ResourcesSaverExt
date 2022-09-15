import styled, { css } from 'styled-components';
import { adjustHue } from 'polished';

export const ButtonWrapper = styled.button`
  border: 0;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => props.theme[props.color || 'primary']};
  color: ${(props) => props.theme.white};
  padding: 10px 20px;
  outline: none;
  white-space: nowrap;
  cursor: pointer;
  transform: scale(1);
  transition: all 0.3s ${(props) => props.theme.elasticBezier};
  &:hover {
    transform: scale(1.05);
    background-color: ${(props) => adjustHue(-50, props.theme[props.color || 'primary'])};
  }
  ${(props) =>
    props.disabled
      ? css`
          background-color: ${(props) => props.theme.grayScale.gray1};
          pointer-events: none;
        `
      : ``};
`;
