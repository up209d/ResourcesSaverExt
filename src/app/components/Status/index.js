import React from 'react';
import { withTheme } from 'styled-components';
import { StatusWrapper } from './styles';

export const Status = props => {
  const { staticResource = [], networkResource = [] } = props;
  return (
    <StatusWrapper>
      {staticResource && <span>Static Resources: {staticResource.length}</span>}
      {networkResource && <span>Network Resources: {networkResource.length}</span>}
    </StatusWrapper>
  );
}

export default withTheme(Status);