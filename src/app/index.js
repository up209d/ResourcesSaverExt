import React, { useEffect, useMemo } from 'react';
import { getTheme } from './themes';
import { ThemeProvider } from 'styled-components';
import { Wrapper } from 'app/styles';
import Header from 'app/components/Header';
import Status from 'app/components/Status';
import useStore from 'app/store';
import * as staticResourceActions from 'app/store/staticResource';
import * as networkResourceActions from 'app/store/networkResource';
import { processNetworkResourceToStore, processStaticResourceToStore } from 'app/utils/resource';

export const App = props => {
  const { theme } = props;
  const [state, dispatch] = useStore();
  const { staticResource, networkResource } = state;
  const currentTheme = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background;
  }, [theme]);

  useEffect(() => {
    //This can be used for detecting when a request is finished
    chrome.devtools.network.onRequestFinished.addListener(req => processNetworkResourceToStore(dispatch, req));

    //This can be used for identifying when ever a new resource is added
    chrome.devtools.inspectedWindow.onResourceAdded.addListener(res => processStaticResourceToStore(dispatch, res));

    //This can be used to detect when ever a resource code is changed/updated
    chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(res => processStaticResourceToStore(dispatch, res));

    return () => {
      dispatch(staticResourceActions.resetStaticResource());
      dispatch(networkResourceActions.resetNetworkResource());
    };
  }, []);

  window.debugState = state;
  window.debugTheme = currentTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <Wrapper>
        <Header />
        <Status staticResource={staticResource} networkResource={networkResource} />
      </Wrapper>
    </ThemeProvider>
  );
}
export default App;
