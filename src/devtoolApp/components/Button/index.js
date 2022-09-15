import React from 'react';
import { ButtonWrapper } from './styles';

export const Button = ({ color, children, onClick, disabled }) => (
  <ButtonWrapper color={color} onClick={onClick} disabled={disabled}>
    {children}
  </ButtonWrapper>
);

export default Button;
