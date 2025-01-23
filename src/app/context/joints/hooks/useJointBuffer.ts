import { useRef, useState, useCallback } from "react";
import { CircularBuffer } from "../../../../utils";
import { JointEvent, JointBufferType } from "../joints.types";
import { JOINT_EVENT_BUFFER_SIZE } from "../../../../constants";

const useJointBuffer = () => {
  const jointBuffersRef = useRef<{ [key: string]: CircularBuffer<JointEvent> }>(
    {}
  );
  const [jointBuffer, setJointBuffer] = useState<JointBufferType>({});

  const updateBuffer = useCallback(
    (jointValues: { [key: string]: number }, time: number) => {
      // Add new joint events to their respective buffers
      Object.entries(jointValues).forEach(([name, value]) => {
        if (!jointBuffersRef.current[name]) {
          jointBuffersRef.current[name] = new CircularBuffer<JointEvent>(
            JOINT_EVENT_BUFFER_SIZE
          );
        }

        jointBuffersRef.current[name].add({ time, name, value });
      });

      // Prepare a snapshot of the current buffer state for all joints
      const updatedBuffer: JointBufferType = {};
      Object.entries(jointBuffersRef.current).forEach(([name, buffer]) => {
        updatedBuffer[name] = buffer.getValues();
      });

      setJointBuffer(updatedBuffer);
    },
    []
  );

  return { jointBuffer, updateBuffer };
};

export default useJointBuffer;
