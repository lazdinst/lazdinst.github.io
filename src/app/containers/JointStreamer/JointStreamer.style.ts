import styled from "styled-components";
// Styled Components
export const Container = styled.div`
  padding: 1rem;
`;

export const Title = styled.h2`
  margin-bottom: 1rem;
`;

export const ToggleButton = styled.button`
  padding: 0.5rem 1rem;
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
  margin-top: 1rem;
`;

export const JointItem = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const ReadOnlyInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
`;
