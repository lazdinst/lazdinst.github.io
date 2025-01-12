import styled from "styled-components";

export const Container = styled.div`
  position: absolute;
  bottom: 16px;
  display: flex;
  width: fit-content;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

// DEPRECATED
export const Title = styled.h2`
  margin-bottom: 1rem;
`;

export const ToggleButton = styled.button`
  width: auto;
  height: fit-content;
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
  display: flex;
`;

export const JointItem = styled.div`
  margin-right: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

export const ReadOnlyInput = styled.input`
  padding: 0.1rem;
  width: auto;
  max-width: 42px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
`;
