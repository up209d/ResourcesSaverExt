import React from 'react';
import { withTheme } from 'styled-components';
import { StatusWrapper, CountWrapper, StatusMessage } from './styles';
import { useStore } from 'devtoolApp/store';

export const Status = () => {
  const { state } = useStore();
  const {
    staticResource,
    networkResource,
    ui: { status },
  } = state;
  return (
    <StatusWrapper>
      <CountWrapper>
        {staticResource && <span>Static Resources: {staticResource.length}</span>}
        {networkResource && <span>Network Resources: {networkResource.length}</span>}
      </CountWrapper>
      <StatusMessage>
        <span>{status}</span>
      </StatusMessage>
    </StatusWrapper>
  );
};

export default withTheme(Status);
