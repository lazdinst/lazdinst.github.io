import { useCartesian } from "../../context";
import { cartesianFieldConfig } from "./cartesianFieldConfig";
import { NumericInput, SectionTitle } from "../../components";
import { CartesianPositionsType } from "../../context/cartesian/cartesian.types";

import { FormKeys } from "../../../definitions";
import { Container } from "./Catesian.style";

const CartesianControl: React.FC = () => {
  const { positions, updateCartesianPosition } = useCartesian();

  const handleSetValue = (id: FormKeys, value: number) => {
    updateCartesianPosition(id as keyof CartesianPositionsType, value);
  };

  return (
    <Container id="cartesian-form">
      <SectionTitle title="Cartesian Control" />
      {Object.entries(cartesianFieldConfig).map(([key, config]) => {
        const typedKey = key as keyof CartesianPositionsType;
        return (
          <NumericInput
            key={typedKey}
            id={typedKey as FormKeys}
            label={key}
            value={positions[typedKey]}
            onChange={handleSetValue}
            disabled={false}
            min={config.min}
            max={config.max}
            step={1}
          />
        );
      })}
    </Container>
  );
};

export default CartesianControl;
