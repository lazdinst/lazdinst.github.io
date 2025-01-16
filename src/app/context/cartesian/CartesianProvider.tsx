import React, { useState } from "react";
import {
  CartesianProviderProps,
  CartesianPositionsType,
} from "./cartesian.types";
import CartesianContext from "./CartesianContext";
import { useUpdateCartesian } from "./hooks/useUpdateCartesian";

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

  // Set a single cartesian position
  const setCartesianPosition = (
    position: keyof CartesianPositionsType,
    value: number
  ) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [position]: value,
    }));
  };

  // Set all cartesian positions
  const setCartesianPositions = (positions: CartesianPositionsType) => {
    setPositions(positions);
  };

  const updateCartesian = useUpdateCartesian();

  return (
    <CartesianContext.Provider
      value={{
        positions,
        setCartesianPosition,
        setCartesianPositions,
        updateCartesian,
      }}
    >
      {children}
    </CartesianContext.Provider>
  );
};

export default CartesianProvider;
