import { useContext } from "react";
import CatesianContext from "../CartesianContext";

export const useCartesian = () => {
  const context = useContext(CatesianContext);
  if (!context) {
    throw new Error("useCartesian must be used within a CartesianProvider");
  }
  return context;
};
