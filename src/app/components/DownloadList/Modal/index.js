import React, { useContext, useMemo, useState } from 'react';
import {
  DownloadListModalWrapper,
  DownloadListModalBackdrop,
  DownloadInputContainer,
  DownloadInputButtonGroup,
} from './styles';
import { StoreContext } from 'app/store';
import Button from '../../Button';
import * as downloadListActions from 'app/store/downloadList';

export const DownloadListModal = props => {
  const { isOpen, onClose } = props;
  const { state, dispatch } = useContext(StoreContext);
  const { downloadList } = state;
  const [textArea, setTextArea] = useState(
    downloadList
      .slice(1)
      .map(i => i.url)
      .join('\n')
  );
  const handleTextArea = useMemo(() => e => setTextArea(e.target.value), []);
  const handleUrls = useMemo(
    () => () => {
      if (textArea) {
        textArea
          .split('\n')
          // .reduce((acc, i) => [...acc, ...i.split(/https?:\/\//)], [])
          .filter(url => {
            return url.startsWith('http');
          })
          .forEach(url => {
            dispatch(downloadListActions.addDownloadItem({ url }));
          });
      }
      onClose && onClose();
    },
    [textArea, dispatch]
  );
  return (
    <DownloadListModalWrapper isOpen={isOpen}>
      <DownloadListModalBackdrop onClick={onClose} />
      <DownloadInputContainer isOpen={isOpen}>
        <textarea onChange={handleTextArea} value={textArea} />
        <DownloadInputButtonGroup>
          <Button color={`primary`} onClick={handleUrls}>
            Parse URLs
          </Button>
          <Button color={`danger`} onClick={onClose}>
            Cancel
          </Button>
        </DownloadInputButtonGroup>
      </DownloadInputContainer>
    </DownloadListModalWrapper>
  );
};

export default DownloadListModal;
