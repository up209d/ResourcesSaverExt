import React, { useCallback, useEffect, useRef } from 'react';
import { withTheme } from 'styled-components';
import { HeaderWrapper } from './styles';
import ResetButton from 'devtoolApp/components/ResetButton';
import Button from 'devtoolApp/components/Button';
import { useStore } from 'devtoolApp/store';
import { downloadZipFile, resolveDuplicatedResources } from 'devtoolApp/utils/file';
import { logResourceByUrl } from '../../utils/resource';
import * as uiActions from 'devtoolApp/store/ui';
import { INITIAL_STATE as UI_INITIAL_STATE } from 'devtoolApp/store/ui';
import { resetNetworkResource } from 'devtoolApp/store/networkResource';
import { resetStaticResource } from 'devtoolApp/store/staticResource';
import { useAppSaveAllResource } from '../../hooks/useAppSaveAllResource';

export const Header = (props) => {
  const { state } = useStore();
  const {
    ui: { status, isSaving },
  } = state;
  const { handleOnSave } = useAppSaveAllResource();
  return (
    <HeaderWrapper>
      <div>
        <span>Resources Saver</span>
        <sup>Version: 2.0.0</sup>
        <ResetButton color={props.theme.white} bgColor={props.theme.danger} />
      </div>
      <Button onClick={handleOnSave} disabled={status !== UI_INITIAL_STATE.status || isSaving}>
        {isSaving ? `Saving all resource...` : `Save All Resources`}
      </Button>
    </HeaderWrapper>
  );
};

export default withTheme(Header);
