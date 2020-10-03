import styled, { css } from 'styled-components';
import { adjustHue } from 'polished';
import { ELASTIC_BEZIER } from 'app/styles';

export const ButtonWrapper = styled.button`
  border: 0;
  border-radius: ${props => props.theme.buttonBorderRadius}px;
  background-color: ${props => props.theme[props.color || 'primary']};
  color: ${props => props.theme.white};
  padding: 10px 20px;
  outline: none;
  cursor: pointer;
  transform: scale(1);
  transition: all 0.3s ${ELASTIC_BEZIER};
  &:hover {
    transform: scale(1.05);
    background-color: ${props => adjustHue(-50, props.theme[props.color || 'primary'])};
  }
  ${props =>
    props.disabled
      ? css`
          background-color: ${props => props.theme.grayScale.gray1};
          pointer-events: none;
        `
      : ``};
`;
