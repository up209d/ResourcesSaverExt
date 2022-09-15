import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { ButtonWrapper } from '../Button/styles';

export const DownloadListWrapper = styled.div``;

export const DownloadListHeader = styled.h2`
  font-size: 20px;
  padding: 0 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => props.theme.text};
`;

export const DownloadListContainer = styled.div`
  color: ${(props) => props.theme.text};
  margin: 0 20px;
  padding: 10px 0;
`;

export const DownloadListItemWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  padding: 10px 20px;
  border-radius: ${(props) => props.theme.borderRadius}px;
  background-color: ${(props) => props.theme.grayScale.gray1};
  &:not(:last-child) {
    border-bottom: 1px dotted ${(props) => (props.logExpanded ? `transparent` : props.theme.grayScale.gray5)};
  }

  ${(props) =>
    props.highlighted
      ? css`
          background-color: ${rgba(props.theme.primary, 0.2)};
          font-weight: 800;
          position: relative;
        `
      : ``};

  ${(props) =>
    props.done
      ? css`
          background-color: ${rgba(props.theme.secondary, 0.2)};
          font-weight: 800;
          position: relative;
        `
      : ``};

  ${ButtonWrapper} {
    padding: 10px 20px;
    font-size: 12px;
    margin-left: 5px;
  }
`;

export const DownloadListButtonGroup = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
`;

export const DownloadListItemUrl = styled.div`
  overflow-wrap: anywhere;
  padding-right: 20px;
  line-height: 20px;
  font-size: 14px;
  position: relative;
  ${(props) =>
    props.active
      ? css`
          padding-left: 10px;
          &::before {
            content: '';
            display: block;
            position: absolute;
            color: white;
            top: 5px;
            left: 0;
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
  margin: 0 20px;
  ${ButtonWrapper} {
    font-size: 12px;
    margin-right: 10px;
    padding: 10px 20px;
  }
`;
