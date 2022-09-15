import React, { useEffect, useMemo } from 'react';
import { getTheme } from './themes';
import { ThemeProvider } from 'styled-components';
import { Wrapper } from 'devtoolApp/styles';
import Header from 'devtoolApp/components/Header';
import Status from 'devtoolApp/components/Status';
import { StoreContext, useStore, useStoreConfigure } from 'devtoolApp/store';
import DownloadList from './components/DownloadList';
import * as uiActions from './store/ui';
import * as downloadListActions from './store/downloadList';
import { useAppTheme } from './hooks/useAppTheme';
import { useAppInit } from './hooks/useAppInit';
import { useAppRecordingStaticResource } from './hooks/useAppRecordingStaticResource';
import { useAppRecordingNetworkResource } from './hooks/useAppRecordingNetworkResource';

export const DevToolApp = ({ initialChromeTab }) => {
  useAppInit();
  useAppRecordingStaticResource();
  useAppRecordingNetworkResource();

  const { dispatch } = useStore();

  useEffect(() => {
    if (initialChromeTab) {
      dispatch(uiActions.setTab(initialChromeTab));
      dispatch(
        downloadListActions.replaceDownloadItem(
          {
            url: initialChromeTab.url,
          },
          0,
          true
        )
      );
    }
  }, [initialChromeTab, dispatch]);

  return (
    <Wrapper>
      <Header />
      <Status />
      <DownloadList />
    </Wrapper>
  );
};

export const App = (props) => {
  const { initialChromeTab } = props;
  const [state, dispatch] = useStoreConfigure();
  return (
    <StoreContext.Provider value={useMemo(() => ({ state, dispatch }), [state, dispatch])}>
      <ThemeProvider theme={useAppTheme()}>
        <DevToolApp initialChromeTab={initialChromeTab} />
      </ThemeProvider>
    </StoreContext.Provider>
  );
};

export default App;
