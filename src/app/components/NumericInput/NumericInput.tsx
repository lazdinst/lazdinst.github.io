import React from "react";
import {
  NumericInputWrapper,
  NumericInput,
  IncrementButton,
  NumericButtonContainer,
} from "./NumericInput.style";

interface NumericInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const NumericInputComponent: React.FC<NumericInputProps> = ({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  onChange,
}) => {
  const incrementValue = () => {
    if (!disabled && value + step <= max) {
      onChange(value + step);
    }
  };

  const decrementValue = () => {
    if (!disabled && value - step >= min) {
      onChange(value - step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <NumericInputWrapper>
      <NumericInput
        value={value ?? 0}
        onChange={handleInputChange}
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
  );
};

export default NumericInputComponent;
