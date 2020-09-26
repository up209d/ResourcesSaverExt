import styled from 'styled-components';
import { THEME_KEYS } from '../../themes';

export const HeaderWrapper = styled.h1`
  color: ${props => props.theme.text};
  font-size: 30px;
  font-weight: bold;
  position: relative;
  padding: 30px 0 15px 0;
  margin: 20px;
  border-bottom: 1px solid ${props => props.theme.getShade(0.1)};
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  sup {
    position: absolute;
    font-size: 10px;
    letter-spacing: 1px;
    top: 20px;
    left: 0;
    color: ${props => props.theme.name === THEME_KEYS.DARK ? props.theme.text : props.theme.secondary};
  }
`;
