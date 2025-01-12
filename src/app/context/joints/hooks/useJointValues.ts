import { useEffect, useState } from "react";
import { URDFJoint } from "../../../../definitions";
import { JOINT_STREAM_INTERVAL } from "../../../../constants";
import { JointValuesType } from "../joints.types";

export const useJointValues = (joints: { [key: string]: URDFJoint }) => {
  const [jointValues, setJointValues] = useState<JointValuesType>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const values = Object.keys(joints).reduce((acc, name) => {
        const joint = joints[name];
        acc[name] = joint.angle;
        return acc;
      }, {} as JointValuesType);

      setJointValues(values);
    }, JOINT_STREAM_INTERVAL);

    return () => clearInterval(interval);
  }, [joints]);

  return jointValues;
};
