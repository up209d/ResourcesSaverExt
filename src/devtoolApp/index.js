import React, { useEffect, useMemo } from 'react';
import { getTheme } from './themes';
import { ThemeProvider } from 'styled-components';
import { Wrapper } from 'devtoolApp/styles';
import Header from 'devtoolApp/components/Header';
import Status from 'devtoolApp/components/Status';
import { useStore, StoreContext } from 'devtoolApp/store';
import * as staticResourceActions from 'devtoolApp/store/staticResource';
import * as networkResourceActions from 'devtoolApp/store/networkResource';
import { processNetworkResourceToStore, processStaticResourceToStore } from 'devtoolApp/utils/resource';
import DownloadList from './components/DownloadList';
import * as uiActions from './store/ui';
import * as downloadListActions from './store/downloadList';
import * as downloadLogActions from './store/downloadLog';

export const App = (props) => {
  const { theme, initialTab } = props;
  const [state, dispatch, store] = useStore();
  const currentTheme = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background;
  }, [theme]);

  useEffect(() => {
    //Get all HARs that were already captured
    chrome.devtools.network.getHAR((logInfo) => {
      if (logInfo && logInfo.entries && logInfo.entries.length) {
        logInfo.entries.forEach((req) => processNetworkResourceToStore(dispatch, req));
      }
    });

    //This can be used for detecting when a request is finished
    chrome.devtools.network.onRequestFinished.addListener((req) => processNetworkResourceToStore(dispatch, req));

    //Get all resources that were already cached
    chrome.devtools.inspectedWindow.getResources((resources) => {
      if (resources && resources.length) {
        resources.forEach((res) => processStaticResourceToStore(dispatch, res));
      }
    });

    //This can be used for identifying when ever a new resource is added
    chrome.devtools.inspectedWindow.onResourceAdded.addListener((res) => processStaticResourceToStore(dispatch, res));

    //This can be used to detect when ever a resource code is changed/updated
    chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener((res) =>
      processStaticResourceToStore(dispatch, res)
    );

    return () => {
      dispatch(staticResourceActions.resetStaticResource());
      dispatch(networkResourceActions.resetNetworkResource());
    };
  }, [dispatch]);

  useEffect(() => {
    if (initialTab) {
      dispatch(uiActions.setTab(initialTab));
      dispatch(
        downloadListActions.replaceDownloadItem(
          {
            url: initialTab.url,
          },
          0,
          true
        )
      );
    }
  }, [initialTab, dispatch]);

  // Debug log
  useEffect(() => {
    setTimeout(() => {
      const { staticResource, networkResource } = window.debugState;
      console.log(staticResource, networkResource);
      dispatch(
        downloadLogActions.addLogItem({
          url: initialTab.url,
          logs: [...staticResource, ...networkResource].map((i) => ({
            failed: i.failed,
            hasContent: !!i.content,
            url: i.url,
            saveAs: i.saveAs,
          })),
        })
      );
    }, 1000);
  }, []);

  const handleSave = useMemo(() => (res) => console.log(res), []);

  window.debugState = state;
  window.debugTheme = currentTheme;

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('preload').setAttribute('data-hidden', '');
    }, 150);
  }, []);

  return (
    <StoreContext.Provider value={store}>
      <ThemeProvider theme={currentTheme}>
        <Wrapper>
          <Header onSave={handleSave} />
          <Status />
          <DownloadList />
        </Wrapper>
      </ThemeProvider>
    </StoreContext.Provider>
  );
};
export default App;
