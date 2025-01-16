import { ReactNode } from "react";
export interface CartesianPositionsType {
  x: number;
  y: number;
  z: number;
  r1: number;
  r2: number;
  r3: number;
}
export interface CartesianContextProps {
  positions: CartesianPositionsType;
  setCartesianPosition: (
    position: keyof CartesianPositionsType,
    value: number
  ) => void;
  setCartesianPositions: (positions: CartesianPositionsType) => void;
  updateCartesian: (positions: CartesianPositionsType) => void;
}

export interface CartesianProviderProps {
  children: ReactNode;
}
