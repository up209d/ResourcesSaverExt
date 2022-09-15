import { useEffect } from 'react';
import { processStaticResourceToStore } from '../utils/resource';
import * as staticResourceActions from '../store/staticResource';
import useStore from '../store';

export const useAppRecordingStaticResource = () => {
  const { dispatch } = useStore();
  useEffect(() => {
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
    };
  }, [dispatch]);
}
