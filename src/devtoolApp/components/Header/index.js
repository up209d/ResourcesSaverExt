import React, { useMemo } from 'react';
import { withTheme } from 'styled-components';
import { HeaderWrapper } from './styles';
import ResetButton from 'devtoolApp/components/ResetButton';
import Button from 'devtoolApp/components/Button';
import { useStore } from 'devtoolApp/store';
import { INITIAL_STATE as UI_INITIAL_STATE } from 'devtoolApp/store/ui';
import { useAppSaveAllResource } from '../../hooks/useAppSaveAllResource';
import packageJson from '/package.json';

export const Header = (props) => {
  const { state } = useStore();
  const {
    ui: { status, isSaving },
  } = state;
  const { handleOnSave } = useAppSaveAllResource();

  const saveText = useMemo(() => {
    if (status !== UI_INITIAL_STATE.status) {
      return 'Processing resources...';
    }
    return isSaving ? `Saving all resource...` : `Save All Resources`;
  }, [status, isSaving]);

  return (
    <HeaderWrapper>
      <div>
        <span>Resources Saver</span>
        <sup>Version: {packageJson?.version || 'LOCAL'}</sup>
        <ResetButton color={props.theme.white} bgColor={props.theme.danger} />
      </div>
      <Button onClick={handleOnSave} disabled={status !== UI_INITIAL_STATE.status || isSaving}>
        {saveText}
      </Button>
    </HeaderWrapper>
  );
};

export default withTheme(Header);
