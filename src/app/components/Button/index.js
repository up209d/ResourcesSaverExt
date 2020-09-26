import React from 'react';
import { ButtonWrapper } from './styles';

export const Button = ({ color, children }) => (
  <ButtonWrapper color={color}>
    {children}
  </ButtonWrapper>
);

export default Button;
