import styled from "styled-components";

export const Container = styled.div`
  position: absolute;
  bottom: 16px;
  display: flex;
  width: fit-content;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.surfaces.card};
  padding: 0.25rem;
  border-radius: 4px;
`;

export const ToggleButton = styled.button`
  width: 32px;
  height: fit-content;
  padding: 0.25rem 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export const JointList = styled.div`
  display: flex;
`;

export const JointItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 0.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-right: 0.25rem;
  font-size: 0.875rem;
`;

export const ReadOnlyInput = styled.input`
  padding: 0.1rem;
  width: auto;
  max-width: 42px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: right;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surfaces.card};
`;
