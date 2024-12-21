import { Middleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export interface CustomAction {
  type: string;
  error?: {
    message?: string;
  };
  payload: string;
}

// TODO: This could be made so its modular and has unique conditions for each toast
export const toastMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    const typedAction = action as CustomAction;

    const serverConnected = store.getState().server.connected;

    if (serverConnected) {
      if (
        typedAction.type?.endsWith("/rejected") &&
        typedAction.error?.message
      ) {
        const errorMessage = typedAction?.payload;
        toast.error(
          errorMessage || "An error occurred; No error message provided."
        );
      }
    }

    return next(action);
  };

export default toastMiddleware;
