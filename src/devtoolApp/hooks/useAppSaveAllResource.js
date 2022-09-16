import { useCallback, useEffect, useRef } from 'react';
import * as uiActions from '../store/ui';
import { downloadZipFile, resolveDuplicatedResources } from '../utils/file';
import { logResourceByUrl } from '../utils/resource';
import { resetNetworkResource } from '../store/networkResource';
import { resetStaticResource } from '../store/staticResource';
import { INITIAL_STATE as UI_INITIAL_STATE } from '../store/ui';
import useStore from '../store';

export const useAppSaveAllResource = () => {
  const { state, dispatch } = useStore();
  const { networkResource, staticResource } = state;
  const networkResourceRef = useRef(networkResource);
  const staticResourceRef = useRef(staticResource);
  const {
    downloadList,
    option: { ignoreNoContentFile, beautifyFile },
    ui: { tab },
  } = state;

  const handleOnSave = useCallback(async () => {
    dispatch(uiActions.setIsSaving(true));
    for (let i = 0; i < downloadList.length; i++) {
      const downloadItem = downloadList[i];
      dispatch(uiActions.setSavingIndex(i));
      await new Promise(async (resolve) => {
        let loaded = true;
        if (i > 0 || tab?.url !== downloadItem.url) {
          loaded = await new Promise((r) => {
            const tabChangeHandler = (tabId, changeInfo) => {
              if (tabId !== chrome.devtools.inspectedWindow.tabId || !changeInfo || !changeInfo.status) {
                return;
              }
              if (changeInfo.status === 'loading') {
                return;
              }
              if (changeInfo.status === 'complete') {
                setTimeout(() => {
                  r(true);
                }, 2000);
              } else {
                r(false);
              }
              chrome.tabs.onUpdated.removeListener(tabChangeHandler);
            };
            chrome.tabs.onUpdated.addListener(tabChangeHandler);
            setTimeout(function () {
              dispatch(uiActions.setTab({ url: downloadItem.url }));
              chrome.tabs.update(chrome.devtools.inspectedWindow.tabId, { url: downloadItem.url });
            }, 500);
          });
        }
        const toDownload = resolveDuplicatedResources([
          ...(networkResourceRef.current || []),
          ...(staticResourceRef.current || []),
        ]);
        if (loaded && toDownload.length) {
          downloadZipFile(
            toDownload,
            { ignoreNoContentFile, beautifyFile },
            (item, isDone) => {
              dispatch(uiActions.setStatus(`Compressed: ${item.url} Processed: ${isDone}`));
            },
            () => {
              logResourceByUrl(dispatch, downloadItem.url, toDownload);
              if (i + 1 !== downloadList.length) {
                dispatch(resetNetworkResource());
                dispatch(resetStaticResource());
              }
              resolve();
            }
          );
        }
      });
    }
    dispatch(uiActions.setStatus(UI_INITIAL_STATE.status));
    dispatch(uiActions.setIsSaving(false));
  }, [state, dispatch, tab]);

  useEffect(() => {
    networkResourceRef.current = networkResource;
  }, [networkResource]);

  useEffect(() => {
    staticResourceRef.current = staticResource;
  }, [staticResource]);

  return { handleOnSave };
};
