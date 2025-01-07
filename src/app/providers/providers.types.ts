import { ReactNode, FC } from "react";

export interface AppProvidersProps {
  children: ReactNode;
}

export type ProviderComponent = FC<{ children: ReactNode }>;
