import React, { useState } from "react";
import {
  CartesianProviderProps,
  CartesianPositionsType,
  UpdatePositions,
} from "./cartesian.types";
import CartesianContext from "./CartesianContext";

const initialPositions: CartesianPositionsType = {
  x: 1,
  y: 1,
  z: 1,
  r1: 1,
  r2: 1,
  r3: 1,
};

const CartesianProvider: React.FC<CartesianProviderProps> = ({ children }) => {
  const [positions, setPositions] =
    useState<CartesianPositionsType>(initialPositions);

  const updateCartesianPositions = (update: UpdatePositions) => {
    setPositions((prevPositions) =>
      "positions" in update
        ? update.positions
        : { ...prevPositions, [update.position]: update.value }
    );
  };

  const updateCartesianPosition = (
    id: keyof CartesianPositionsType,
    value: number
  ) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [id]: value,
    }));
  };

  return (
    <CartesianContext.Provider
      value={{
        positions,
        updateCartesianPositions,
        updateCartesianPosition,
      }}
    >
      {children}
    </CartesianContext.Provider>
  );
};

export default CartesianProvider;
