import React from 'react';
import { withTheme } from 'styled-components';
import { HeaderWrapper } from './styles';
import ResetButton from '/app/components/ResetButton';
import Button from '/app/components/Button';

export const Header = props => {
  return (
    <HeaderWrapper>
      <div>
        <span>Resources Saver</span>
        <sup>Version: 2.0.0</sup>
        <ResetButton
          color={props.theme.white}
          bgColor={props.theme.danger}
        />
      </div>
      <Button>
        Save All Resources
      </Button>
    </HeaderWrapper>
  );
};

export default withTheme(Header);
