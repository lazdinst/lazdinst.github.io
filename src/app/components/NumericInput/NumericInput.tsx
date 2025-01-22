import React from "react";
import {
  NumericInputWrapper,
  NumericInput,
  IncrementButton,
  NumericButtonContainer,
  NumericInputLabel,
  NumericInputContainer,
} from "./NumericInput.style";
import { FormKeys } from "../../../definitions";
interface NumericInputProps {
  id: FormKeys;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (id: FormKeys, value: number) => void;
}

const NumericInputComponent: React.FC<NumericInputProps> = ({
  id,
  label,
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  onChange,
}) => {
  const incrementValue = () => {
    if (!disabled && value + step <= max) {
      onChange(id, value + step);
    }
  };

  const decrementValue = () => {
    if (!disabled && value - step >= min) {
      onChange(id, value - step);
    }
  };

  const handleInputChange = (id: FormKeys, value: number) => {
    onChange(id, value);
  };

  return (
    <NumericInputContainer>
      <NumericInputLabel>{label}:</NumericInputLabel>
      <NumericInputWrapper>
        <NumericInput
          value={value ?? 0}
          onChange={(e) => handleInputChange(id, parseFloat(e.target.value))}
          disabled={disabled}
          min={min}
          max={max}
        />
        <NumericButtonContainer>
          <IncrementButton onClick={incrementValue} disabled={disabled}>
            +
          </IncrementButton>
          <IncrementButton onClick={decrementValue} disabled={disabled}>
            -
          </IncrementButton>
        </NumericButtonContainer>
      </NumericInputWrapper>
    </NumericInputContainer>
  );
};

export default NumericInputComponent;
