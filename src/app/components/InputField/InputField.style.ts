import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const Input = styled.input`
  font-size: ${({ theme }) => theme.typography.fontSize.medium};
  border: 1px solid ${({ theme }) => theme.components.inputField.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.components.inputField.background};
  color: ${({ theme }) => theme.components.inputField.text};

  &::placeholder {
    color: ${({ theme }) => theme.components.inputField.placeholder};
  }

  &:hover {
    border-color: ${({ theme }) => theme.components.inputField.hover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.components.inputField.focus};
    outline: none;
    box-shadow: 0 0 4px 2px
      ${({ theme }) => theme.components.inputField.focus}33; /* 20% opacity */
  }

  &:disabled {
    background-color: ${({ theme }) =>
      theme.components.inputField.disabled.background};
    color: ${({ theme }) => theme.components.inputField.disabled.text};
    border-color: ${({ theme }) => theme.components.inputField.disabled.border};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.small};
`;
