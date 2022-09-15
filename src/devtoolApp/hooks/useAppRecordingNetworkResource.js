import { useEffect } from 'react';
import { processNetworkResourceToStore } from '../utils/resource';
import * as networkResourceActions from '../store/networkResource';
import useStore from '../store';

export const useAppRecordingNetworkResource = () => {
  const { dispatch } = useStore();
  useEffect(() => {
    //Get all HARs that were already captured
    chrome.devtools.network.getHAR((logInfo) => {
      if (logInfo && logInfo.entries && logInfo.entries.length) {
        logInfo.entries.forEach((req) => processNetworkResourceToStore(dispatch, req));
      }
    });

    //This can be used for detecting when a request is finished
    chrome.devtools.network.onRequestFinished.addListener((req) => processNetworkResourceToStore(dispatch, req));

    return () => {
      dispatch(networkResourceActions.resetNetworkResource());
    };
  }, [dispatch]);
};
