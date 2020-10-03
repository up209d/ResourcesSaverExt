import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { ButtonWrapper } from '../Button/styles';

export const DownloadListWrapper = styled.div``;

export const DownloadListContainer = styled.div`
  color: ${props => props.theme.text};
  margin: 20px;
  padding: 10px 0;
  border-radius: ${props => props.theme.buttonBorderRadius}px;
  background-color: ${props => props.theme.grayScale.gray1};
`;

export const DownloadListItemWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  &:not(:last-child) {
    border-bottom: 1px dotted ${props => props.theme.grayScale.gray5};
  }

  ${props =>
    props.highlighted
      ? css`
          padding-left: 30px;
          background-color: ${rgba(props.theme.primary, 0.2)};
          font-weight: 800;
          position: relative;
        `
      : ``};

  ${props =>
    props.active
      ? css`
          padding-left: 30px;
          background-color: ${rgba(props.theme.secondary, 0.2)};
          font-weight: 800;
          position: relative;
        `
      : ``};

  ${ButtonWrapper} {
    padding: 5px 10px;
    font-size: 12px;
  }
`;

export const DownloadListItemUrl = styled.div`
  overflow-wrap: anywhere;
  padding-right: 20px;
  line-height: 20px;
  font-size: 14px;
  ${props =>
    props.active
      ? css`
          &::before {
            content: '';
            display: block;
            position: absolute;
            color: white;
            top: 15px;
            left: 15px;
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-left: 5px solid ${props.theme.white};
          }
        `
      : ``};
`;

export const AddButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  margin: 10px 20px;
`;
