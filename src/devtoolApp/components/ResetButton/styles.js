import styled from 'styled-components';
import { adjustHue } from 'polished';

export const ResetButtonWrapper = styled.div`
  width: 40px;
  height: 40px;
  padding: 5px;
  margin-left: 5px;
  background-color: ${props => props.bgColor || (props.theme && props.theme.background)};
  transform: scale(0.75) rotate(0deg);
  display: inline-block;
  border-radius: 50%;
  box-sizing: border-box;
  transition: all 0.3s ${props => props.theme.elasticBezier}, background-color 0.3s ease-out;
  cursor: pointer;
  &:hover {
    transform: scale(0.9) rotate(180deg);
    background-color: ${props => adjustHue(-20, props.bgColor || (props.theme && props.theme.background))};
  }
`;
