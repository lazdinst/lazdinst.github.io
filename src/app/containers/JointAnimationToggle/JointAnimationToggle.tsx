import React from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../redux/store";
import {
  toggleJointAnimation,
  setJointAnimationType,
} from "../../../redux/slices/settings";
import {
  CheckboxLabel,
  ToggleInput,
  ToggleSlider,
  Dropdown,
  DropdownLabel,
} from "./JointAnimationToggle.style";
import {
  animationTypes,
  AnimationType,
} from "../../../redux/slices/settings/settings.types";

const JointAnimationToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jointAnimationEnabled, jointAnimationType } = useSelector(
    (state: RootState) => state.settings
  );

  const handleToggleJointAnimation = () => {
    dispatch(toggleJointAnimation());
  };

  const handleAnimationTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setJointAnimationType(event.target.value as AnimationType));
  };

  return (
    <div>
      <CheckboxLabel>
        <ToggleInput
          type="checkbox"
          checked={jointAnimationEnabled}
          onChange={handleToggleJointAnimation}
        />
        <ToggleSlider />
        Joint Animation
      </CheckboxLabel>

      <DropdownLabel>
        Animation Type:
        <Dropdown
          value={jointAnimationType}
          onChange={handleAnimationTypeChange}
        >
          {animationTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
            </option>
          ))}
        </Dropdown>
      </DropdownLabel>
    </div>
  );
};

export default JointAnimationToggle;
