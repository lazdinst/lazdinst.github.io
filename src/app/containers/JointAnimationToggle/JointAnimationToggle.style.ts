import styled from "styled-components";

export const Title = styled.h2`
  font-weight: 1;
  font-size: 1rem;
  margin: 0.25rem 0;
  text-align: left;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  cursor: pointer;
`;

export const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${(props) => props.theme.colors.primary};
  }

  &:checked + span::before {
    transform: translateX(20px);
  }
`;

export const ToggleSlider = styled.span`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: ${(props) => props.theme.colors.surfaces.background};
  border-radius: 20px;
  transition: background-color 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    height: 16px;
    width: 16px;
    background-color: ${(props) => props.theme.colors.text.primary};
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
  }
`;
