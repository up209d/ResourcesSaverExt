import styled from 'styled-components';
import { rgba } from 'polished';
import { ToggleWrapper } from 'devtoolApp/components/Toggle/styles';

export const LogSectionWrapper = styled.div`
  padding: 20px;
`;

export const LogSectionTitle = styled.h3`
  font-size: 14px;
  text-transform: uppercase;
`;

export const LogSectionFilter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 0;
`;

export const LogSectionFilterToggle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  ${ToggleWrapper} {
    margin-right: 10px;
  }
`;

export const LogSectionFilterInput = styled.input`
  border: none;
  border-radius: ${(props) => props.theme.borderRadius}px;
  height: 30px;
  line-height: 20px;
  padding: 5px 10px;
  background-color: ${(props) => props.theme.grayScale.gray2};
  color: ${(props) => props.theme.text};
  outline: none;
  flex-grow: 1;
  font-size: 12px;
  transition: all 0.15s ease-out;
  &::placeholder {
    color: ${(props) => props.theme.grayScale.gray10};
  }
  &:focus {
    background-color: ${(props) => props.theme.grayScale.gray3};
  }
`;

export const LogSectionList = styled.ul`
  list-style: none;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

export const LogSectionListItem = styled.li`
  display: block;
  width: 100%;
  padding: 10px 20px 10px 10px;
  margin-bottom: 1px;
  font-size: 12px;
  background-color: ${(props) => (props.bgColor ? rgba(props.theme[props.bgColor], 1) : props.theme.grayScale.gray9)};
  color: ${(props) => props.theme.white};
  word-wrap: anywhere;
  &:first-child {
    border-top-left-radius: ${(props) => props.theme.borderRadius}px;
    border-top-right-radius: ${(props) => props.theme.borderRadius}px;
  }
  &:last-child {
    border-bottom-left-radius: ${(props) => props.theme.borderRadius}px;
    border-bottom-right-radius: ${(props) => props.theme.borderRadius}px;
  }
`;
