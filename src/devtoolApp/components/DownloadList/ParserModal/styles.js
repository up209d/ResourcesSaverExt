import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { ButtonWrapper } from 'devtoolApp/components/Button/styles';

export const Z_INDEX = 9;

export const ParserModalWrapper = styled.div`
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
  ${(props) =>
    props.isOpen
      ? css`
          opacity: 1;
          pointer-events: all;
        `
      : ``};
`;

export const ParserModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${Z_INDEX + 1};
  width: 100%;
  height: 100%;
  background-color: ${(props) => rgba(props.theme.black, 0.75)};
`;

export const ParserTextContainer = styled.div`
  position: absolute;
  width: 80vw;
  height: 400px;
  top: calc(50% - 200px);
  left: calc(50% - 40vw);
  z-index: ${Z_INDEX + 2};
  box-sizing: border-box;
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius * 2}px;
  background-color: ${(props) => props.theme.white};
  transform: translateY(-50px);
  transition: transform 0.5s ${(props) => props.theme.elasticBezier};
  ${(props) =>
    props.isOpen
      ? css`
          transform: translateY(0);
        `
      : ``};
`;

export const ParserTextArea = styled.textarea`
  width: 100%;
  height: 310px;
  padding: 20px;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => rgba(props.theme.black, 0.05)};
  outline: none;
  resize: none;
`;

export const ParserTextButtonGroup = styled.div`
  padding: 10px 0 0 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  & > ${ButtonWrapper} {
    margin-left: 10px;
  }
`;
