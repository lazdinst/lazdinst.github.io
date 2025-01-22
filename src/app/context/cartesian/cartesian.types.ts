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
  updateCartesianPositions: (update: UpdatePositions) => void;
  updateCartesianPosition: (
    id: keyof CartesianPositionsType,
    value: number
  ) => void;
}

export interface CartesianProviderProps {
  children: ReactNode;
}

export type UpdatePositions =
  | { position: keyof CartesianPositionsType; value: number }
  | { positions: CartesianPositionsType };
