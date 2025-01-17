import React from "react";
import { AppProvidersProps, ProviderComponent } from "./providers.types";
import { JointProvider, CartesianProvider } from "../context";

const providers: ProviderComponent[] = [JointProvider, CartesianProvider];

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <>
      {providers.reduceRight(
        (acc, Provider) => (
          <Provider>{acc}</Provider>
        ),
        children
      )}
    </>
  );
};

export default AppProviders;
