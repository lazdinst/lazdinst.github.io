import React from "react";
import { InputWrapper, Label, Input, ErrorMessage } from "./InputField.style";
import { InputFormField } from "./InputField.types";

const InputField: React.FC<InputFormField> = ({
  label,
  id,
  error,
  min = 0,
  max = 100,
  onChange,
  type = "number",
}) => {
  return (
    <InputWrapper>
      <Label>
        {label}:
        <Input
          type={type}
          id={id}
          min={min}
          max={max}
          onChange={(e) => onChange(id, parseFloat(e.target.value))}
        />
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default InputField;
