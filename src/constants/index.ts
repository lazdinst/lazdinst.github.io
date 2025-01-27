export const JOINT_NAME_MAP: { [key: string]: string } = {
  joint_1: "J1",
  joint_2: "J2",
  joint_3: "J3",
  joint_4: "J4",
  joint_5: "J5",
  joint_6: "J6",
};

export const ALLOWED_JOINTS = Object.keys(JOINT_NAME_MAP).reduce(
  (acc, jointName) => {
    acc[jointName] = true;
    return acc;
  },
  {} as { [key: string]: boolean }
);

export const JOINT_STREAM_INTERVAL = 100;
export const JOINT_EVENT_BUFFER_SIZE = 30;

export const JOINT_CONTROL_INCREMENT = 0.1;
export const JOINT_CONTROL_CLAMP = 3.14;

// Dynamic Layout Constants
export const SEPARATOR_WIDTH = 4;
export const MIN_LEFT_SIDEBAR_WIDTH = 332;
export const MIN_RIGHT_SIDEBAR_WIDTH = 332;
export const MIN_CENTER_WIDTH = 510;
