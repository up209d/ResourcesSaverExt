import styled from 'styled-components';

export const OptionSectionWrapper = styled.div`
  padding: 0 20px 20px 20px;
`;

export const FilterInputWrapper = styled.div`
  margin-bottom: 10px;
`;

export const FilterInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.grayScale.gray5};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FilterLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.grayScale.gray10};
  font-weight: 500;
`;
