import React, { useEffect, useMemo } from 'react';
import { getTheme } from './themes';
import { ThemeProvider } from 'styled-components';
import { Wrapper } from 'app/styles';
import Header from 'app/components/Header';
import Status from 'app/components/Status';
import { useStore, StoreContext } from 'app/store';
import * as staticResourceActions from 'app/store/staticResource';
import * as networkResourceActions from 'app/store/networkResource';
import { processNetworkResourceToStore, processStaticResourceToStore } from 'app/utils/resource';
import DownloadList from './components/DownloadList';
import * as uiActions from './store/ui';
import * as downloadListActions from './store/downloadList';

export const App = props => {
  const { theme, initialTab } = props;
  const [state, dispatch, store] = useStore();
  const currentTheme = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background;
  }, [theme]);

  useEffect(() => {
    //Get all HARs that were already captured
    chrome.devtools.network.getHAR(logInfo => {
      if (logInfo && logInfo.entries && logInfo.entries.length) {
        logInfo.entries.forEach(req => processNetworkResourceToStore(dispatch, req));
      }
    });

    //This can be used for detecting when a request is finished
    chrome.devtools.network.onRequestFinished.addListener(req => processNetworkResourceToStore(dispatch, req));

    //Get all resources that were already cached
    chrome.devtools.inspectedWindow.getResources(resources => {
      if (resources && resources.length) {
        resources.forEach(res => processStaticResourceToStore(dispatch, res));
      }
    });

    //This can be used for identifying when ever a new resource is added
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(res => processStaticResourceToStore(dispatch, res));

    //This can be used to detect when ever a resource code is changed/updated
    chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(res => processStaticResourceToStore(dispatch, res));

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
  }, [initialTab, dispatch])

  const handleSave = useMemo(() => res => console.log(res), []);

  window.debugState = state;
  window.debugTheme = currentTheme;

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
