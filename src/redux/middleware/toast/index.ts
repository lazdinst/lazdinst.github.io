import { Middleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const NO_OP = false;
export interface CustomAction {
  type: string;
  error?: {
    message?: string;
  };
  payload?: string;
}

export const toastMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const typedAction = action as CustomAction;
    if (NO_OP) {
      const state = store.getState();
      console.log("Current State: ", state);
      toast(`Action Type: ${typedAction.type}`, {
        type: "info",
      });
    }
    return next(action);
  };

export default toastMiddleware;
