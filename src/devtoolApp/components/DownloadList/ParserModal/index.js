import React, { useContext, useMemo, useState } from 'react';
import { ParserModalWrapper, ParserModalBackdrop, ParserTextContainer, ParserTextButtonGroup, ParserTextArea } from './styles';
import { StoreContext } from 'devtoolApp/store';
import Button from '../../Button';
import * as downloadListActions from 'devtoolApp/store/downloadList';

export const ParserModal = props => {
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
          // Positive lookahead will match but not including the case
          .reduce((acc, i) => [...acc, ...i.split(/(?=https?:\/\/)/)], [])
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
    <ParserModalWrapper isOpen={isOpen}>
      <ParserModalBackdrop onClick={onClose} />
      <ParserTextContainer isOpen={isOpen}>
        <ParserTextArea placeholder={`Enter URL list that you want to parse...`} onChange={handleTextArea} value={textArea} />
        <ParserTextButtonGroup>
          <Button color={`primary`} onClick={handleUrls}>
            Parse URLs
          </Button>
          <Button color={`danger`} onClick={onClose}>
            Cancel
          </Button>
        </ParserTextButtonGroup>
      </ParserTextContainer>
    </ParserModalWrapper>
  );
};

export default ParserModal;
