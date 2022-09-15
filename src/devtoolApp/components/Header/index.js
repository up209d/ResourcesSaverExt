import React, { useMemo } from 'react';
import { withTheme } from 'styled-components';
import { HeaderWrapper } from './styles';
import ResetButton from 'devtoolApp/components/ResetButton';
import Button from 'devtoolApp/components/Button';
import { useStore } from 'devtoolApp/store';
import { downloadZipFile, resolveDuplicatedResources } from 'devtoolApp/utils/file';
import { INITIAL_STATE as UI_INITIAL_STATE } from 'devtoolApp/store/ui';
import { logResourceByUrl } from '../../utils/resource';
import * as uiActions from 'devtoolApp/store/ui';

export const Header = (props) => {
  const { state, dispatch } = useStore();
  const {
    ui: { tab, status, isSaving },
  } = state;
  const handleOnSave = useMemo(
    () => () => {
      const { networkResource, staticResource } = state;
      const toDownload = resolveDuplicatedResources([...(staticResource || []), ...(networkResource || [])]);
      if (toDownload.length) {
        dispatch(uiActions.setIsSaving(true));
        downloadZipFile(
          toDownload,
          (item, isDone) => {
            dispatch(uiActions.setStatus(`Compressed: ${item.url} Processed: ${isDone}`));
          },
          () => {
            logResourceByUrl(dispatch, tab.url, toDownload);
            dispatch(uiActions.setIsSaving(false));
          }
        );
      }
    },
    [state, dispatch, tab]
  );
  return (
    <HeaderWrapper>
      <div>
        <span>Resources Saver</span>
        <sup>Version: 2.0.0</sup>
        <ResetButton color={props.theme.white} bgColor={props.theme.danger} />
      </div>
      <Button onClick={handleOnSave} disabled={isSaving}>
        {isSaving ? `Saving all resource...` : `Save All Resources`}
      </Button>
    </HeaderWrapper>
  );
};

export default withTheme(Header);
