import styled from 'styled-components';
import { adjustHue } from 'polished';

export const ResetButtonWrapper = styled.div`
  width: 40px;
  height: 40px;
  padding: 5px;
  margin-left: 5px;
  background-color: ${(props) => props.bgColor || (props.theme && props.theme.background)};
  transform: scale(0.75) rotate(0deg);
  display: inline-block;
  border-radius: 50%;
  box-sizing: border-box;
  transition: all 0.3s ${(props) => props.theme.elasticBezier}, background-color 0.3s ease-out;
  cursor: pointer;
  position: relative;
  & > svg {
    transition: all 0.3s ${(props) => props.theme.elasticBezier}, background-color 0.3s ease-out;
  }
  & > div {
    width: 200px;
    padding: 10px;
    border-radius: ${(props) => props.theme.borderRadius}px;
    position: absolute;
    z-index: 1;
    top: 0;
    left: -50px;
    pointer-events: none;
    font-size: 12px;
    transition: all 0.3s ease-out;
    visibility: hidden;
    opacity: 0;
    background-color: ${(props) => props.theme.grayScale.gray25};
    color: ${(props) => props.theme.grayScale.gray1};
    transform: translate(0, calc(-50% - 20px));
  }
  &:hover {
    transform: scale(0.9);
    & > svg {
      transform: scale(1) rotate(180deg);
    }
    & > div {
      visibility: visible;
      opacity: 1;
      transform: translate(0, calc(-50% - 25px));
    }
    background-color: ${(props) => adjustHue(-20, props.bgColor || (props.theme && props.theme.background))};
  }
`;