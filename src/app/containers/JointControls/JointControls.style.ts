import styled from "styled-components";

export const JointControlsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  padding: 10px;
  border-radius: 8px;
  overflow-y: auto;
  max-height: 100vh;
`;

export const Container = styled.div`
  padding: 0.25rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text};
  margin-right: 0.25rem;
`;

export const SliderContainer = styled.div`
  margin-bottom: 10px;
`;

export const JointSettingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
`;

export const Slider = styled.input`
  width: 80%;
  margin-right: 10px;
`;

export const Button = styled.button`
  padding: 0.2rem 0.5rem;
  font-size: 1rem;
  margin-left: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;
