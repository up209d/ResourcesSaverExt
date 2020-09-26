import styled from 'styled-components';
import { adjustHue } from 'polished';
import { ELASTIC_BEZIER } from '/app/styles';

export const InputListWrapper = styled.button`
    border: 0;
    border-radius: ${props => props.theme.buttonBorderRadius}px;
    background-color: ${props => props.theme[props.color || 'primary']};
    color: ${props => props.theme.white};
    padding: 10px 20px;
    outline: none;
    cursor: pointer;
    transform: scale(1);
    transition: all 0.3s ${ELASTIC_BEZIER};
    &:hover {
        transform: scale(1.05) translateX(-5px);
        background-color: ${props => adjustHue(props.theme.factor * 10, props.theme[props.color || 'primary'])};
    }
`;
