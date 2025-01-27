import React from "react";
import {
  CheckboxLabel,
  ToggleInput,
  ToggleSlider,
  ToggleLabel,
} from "./Toggle.style";

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => {
  return (
    <>
      <ToggleLabel>{label}</ToggleLabel>
      <CheckboxLabel>
        <ToggleInput type="checkbox" checked={checked} onChange={onChange} />
        <ToggleSlider />
        {checked ? "Enabled" : "Disabled"}
      </CheckboxLabel>
    </>
  );
};

export default Toggle;
