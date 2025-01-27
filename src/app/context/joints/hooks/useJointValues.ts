import { useEffect, useState, useRef } from "react";
import { URDFJoint } from "urdf-loader";
import { JOINT_STREAM_INTERVAL } from "../../../../constants";
import { JointValuesType } from "../joints.types";
import { isEqual } from "../../../../utils";

export const useJointValues = (joints: { [key: string]: URDFJoint }) => {
  const [jointValues, setJointValues] = useState<JointValuesType>({});
  const previousJointValuesRef = useRef<JointValuesType>({}); // To store the previous values

  useEffect(() => {
    const interval = setInterval(() => {
      const values = Object.keys(joints).reduce((acc, name) => {
        const joint = joints[name];
        acc[name] = Number(joint.angle);
        return acc;
      }, {} as JointValuesType);

      if (!isEqual(values, previousJointValuesRef.current)) {
        setJointValues(values);
        previousJointValuesRef.current = values; // Update the ref with new values
      }
    }, JOINT_STREAM_INTERVAL);

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, [joints]);

  return jointValues;
};
