import { createContext } from "react";
import { JointContextProps } from "./joints.types";

const JointContext = createContext<JointContextProps | undefined>(undefined);

export default JointContext;
