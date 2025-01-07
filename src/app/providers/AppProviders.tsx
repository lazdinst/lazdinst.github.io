import React from "react";
import { AppProvidersProps, ProviderComponent } from "./providers.types";
import { JointProvider } from "../context/joints";

const providers: ProviderComponent[] = [JointProvider];

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
