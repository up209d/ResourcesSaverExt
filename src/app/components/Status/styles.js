import styled from 'styled-components';

export const StatusWrapper = styled.div`
  margin: 20px;
  color: ${props => props.theme.text};
`;

export const CountWrapper = styled.div`
  & > span {
    margin-right: 30px;
    &:not(:last-child) {
      position: relative;
      &::after {
        content: '';
        display: block;
        position: absolute;
        width: 1px;
        height: 100%;
        background-color: ${props => props.theme.text};
        top: 0;
        right: -15px;
      }
    }
  }
`;

export const StatusMessage = styled.div`
  padding: 10px;
  background-color: ${props => props.theme.grayScale.gray2};
  font-size: 12px;
  margin: 10px 0;
  border-radius: ${props => props.theme.buttonBorderRadius}px;
  & > span {
    display: block;
    overflow: hidden;
    white-space: nowrap;
  }
`;
