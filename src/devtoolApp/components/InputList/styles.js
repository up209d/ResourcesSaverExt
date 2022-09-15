import styled from 'styled-components';
import { adjustHue } from 'polished';

export const InputListWrapper = styled.button`
  border: 0;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => props.theme[props.color || 'primary']};
  color: ${(props) => props.theme.white};
  padding: 10px 20px;
  outline: none;
  cursor: pointer;
  transform: scale(1);
  transition: all 0.3s ${(props) => props.theme.elasticBezier};
  &:hover {
    transform: scale(1.05) translateX(-5px);
    background-color: ${(props) => adjustHue(props.theme.factor * 10, props.theme[props.color || 'primary'])};
  }
`;
