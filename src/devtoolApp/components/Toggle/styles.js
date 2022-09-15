import styled, { css } from 'styled-components';
import { lighten } from 'polished';

export const ToggleWrapper = styled.div`
  position: relative;
  padding: 10px 10px 10px 20px;
  cursor: pointer;
  transition: color 0.15s ease-out;
  user-select: none;
  pointer-events: ${props => props.noInteraction ? 'none' : 'all'};
  &::before {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    content: '';
    display: inline-block;
    border: 2px solid;
    position: absolute;
    top: calc(0px + 11px);
    left: 0;
    transition: all 0.15s ease-out;
  }
  &::after {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    content: '';
    display: inline-block;
    position: absolute;
    top: calc(4px + 11px);
    left: 4px;
    transition: all 0.3s ${props => props.theme.elasticBezier};
  }
  ${props => {
    const activeColor = props.theme[props.activeColor]
      ? lighten(props.theme.factor > 0 ? 0 : 0.1, props.theme[props.activeColor])
      : props.theme.text;
    return props.isToggled
      ? css`
          color: ${activeColor};
          &::before {
            border-color: ${activeColor};
          }
          &::after {
            background-color: ${activeColor};
            transform: scale(1);
          }
        `
      : css`
          color: ${props.theme.grayScale.gray5};
          &::before {
            border-color: ${props.theme.grayScale.gray5};
          }
          &::after {
            background-color: transparent;
            transform: scale(0);
          }
          &:hover {
            color: ${props.theme.grayScale.gray9};
            &::before {
              border-color: ${props.theme.grayScale.gray9};
            }
          }
        `;
  }}
`;
