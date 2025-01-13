import styled from "styled-components";

export const NumericInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surfaces.card};
`;

export const NumericButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
`;

export const NumericInput = styled.input`
  width: 64px;
  font-size: 0.875rem;
  text-align: right;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surfaces.card};

  &:disabled {
    background-color: ${({ theme }) => theme.colors.surfaces.card};
    cursor: not-allowed;
  }
`;

export const IncrementButton = styled.button`
  font-size: 0.875rem;
  line-height: 10px;
  border: none;
  padding: 1px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surfaces.card};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.surfaces.card};
    cursor: not-allowed;
  }
`;
