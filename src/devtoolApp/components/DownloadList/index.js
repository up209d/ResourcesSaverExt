import React, { useMemo, useState } from 'react';
import {
  AddButtonWrapper,
  DownloadListHeader,
  DownloadListItemWrapper,
  DownloadListContainer,
  DownloadListWrapper,
  DownloadListItemUrl,
} from './styles';
import { useStore } from 'devtoolApp/store';
import Button from '../Button';
import { withTheme } from 'styled-components';
import ParserModal from './ParserModal';
import * as downloadListActions from 'devtoolApp/store/downloadList';
import * as uiActions from 'devtoolApp/store/ui';
import LogSection from './LogSection';

export const DownloadList = () => {
  const { state, dispatch } = useStore();
  const {
    downloadList,
    downloadLog,
    ui: { tab, log, isSaving },
  } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = useMemo(() => () => setIsModalOpen(false), []);
  const handleOpen = useMemo(() => () => setIsModalOpen(true), []);
  const handleReset = useMemo(
    () => () => downloadList.slice(1).forEach((item) => dispatch(downloadListActions.removeDownloadItem(item))),
    [downloadList, dispatch]
  );
  const handleRemove = (item) => () => dispatch(downloadListActions.removeDownloadItem(item));
  const handleLog = (currentLog) => () => {
    console.log('SET LOG: ', currentLog);
    if (log?.url === currentLog?.url) {
      return dispatch(uiActions.setLog());
    }
    dispatch(uiActions.setLog(currentLog));
  };
  return (
    <DownloadListWrapper>
      <DownloadListHeader>Download List:</DownloadListHeader>
      <DownloadListContainer>
        {downloadList.map((item, index) => {
          const foundLog = downloadLog.find((i) => i.url === item.url);
          const logExpanded = log && log.url === item.url;
          return (
            <React.Fragment key={item.url}>
              <DownloadListItemWrapper highlighted={item.url === tab.url} done={!!foundLog} logExpanded={logExpanded}>
                <DownloadListItemUrl active={isSaving === item.url}>{item.url}</DownloadListItemUrl>
                {foundLog && (
                  <Button color={`secondary`} onClick={handleLog(foundLog)}>
                    {logExpanded ? `Hide Log` : `Show Log`}
                  </Button>
                )}
                {index !== 0 && (
                  <Button color={`danger`} onClick={handleRemove(item)}>
                    Remove
                  </Button>
                )}
              </DownloadListItemWrapper>
              {logExpanded && <LogSection log={log} />}
            </React.Fragment>
          );
        })}
      </DownloadListContainer>
      <AddButtonWrapper>
        <Button color={`primary`} onClick={handleOpen} disabled={isSaving}>
          + Add URLs
        </Button>
        <Button color={`danger`} onClick={handleReset} disabled={isSaving}>
          Reset
        </Button>
      </AddButtonWrapper>
      <ParserModal isOpen={isModalOpen} onClose={handleClose} />
    </DownloadListWrapper>
  );
};

export default withTheme(DownloadList);
