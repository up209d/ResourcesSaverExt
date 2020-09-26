import styled from 'styled-components';

export const StatusWrapper = styled.div`
  margin: 20px;
  color: ${props => props.theme.text};
  & > span {
    margin-right: 30px;
    &:not(:last-child) {
      position: relative;
      &::after {
        content: "";
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