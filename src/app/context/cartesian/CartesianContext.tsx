import { createContext } from "react";
import { CartesianContextProps } from "./cartesian.types";

const CartesianContext = createContext<CartesianContextProps | undefined>(
  undefined
);

export default CartesianContext;
