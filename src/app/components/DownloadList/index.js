import React, { useContext, useMemo, useState } from 'react';
import {
  AddButtonWrapper,
  DownloadListItemWrapper,
  DownloadListContainer,
  DownloadListWrapper,
  DownloadListItemUrl,
} from './styles';
import { StoreContext } from 'app/store';
import Button from '../Button';
import { withTheme } from 'styled-components';
import DownloadListModal from './Modal';
import * as downloadListActions from 'app/store/downloadList';

export const DownloadList = () => {
  const { state, dispatch } = useContext(StoreContext);
  const {
    downloadList,
    ui: { tab },
  } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = useMemo(() => () => setIsModalOpen(false), []);
  const handleOpen = useMemo(() => () => setIsModalOpen(true), []);
  const handleRemove = item => () => dispatch(downloadListActions.removeDownloadItem(item));
  return (
    <DownloadListWrapper>
      <DownloadListContainer>
        {downloadList.map((item, index) => (
          <DownloadListItemWrapper key={item.url} highlighted={item.url === tab.url} active={true} done={true}>
            <DownloadListItemUrl>{item.url}</DownloadListItemUrl>
            {index !== 0 && (
              <Button color={`danger`} onClick={handleRemove(item)}>
                Remove
              </Button>
            )}
          </DownloadListItemWrapper>
        ))}
      </DownloadListContainer>
      <AddButtonWrapper>
        <Button color={`primary`} onClick={handleOpen}>
          +
        </Button>
      </AddButtonWrapper>
      <DownloadListModal isOpen={isModalOpen} onClose={handleClose} />
    </DownloadListWrapper>
  );
};

export default withTheme(DownloadList);
