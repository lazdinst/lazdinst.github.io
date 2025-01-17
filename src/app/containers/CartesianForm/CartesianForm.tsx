import { useCartesian } from "../../context";
import { cartesianFieldConfig } from "./cartesianFieldConfig";
import InputField from "../../components/InputField/InputField";
import { FormKeys } from "../../../definitions";

const CartesianForm = () => {
  const { positions, setCartesianPositions } = useCartesian();

  const handleSetValue = (id: FormKeys, value: number) => {
    setCartesianPositions({
      ...positions,
      [id]: value,
    });
  };

  return (
    <>
      {Object.entries(cartesianFieldConfig).map(([key, config]) => (
        <InputField
          key={key}
          label={config.label}
          id={key as FormKeys}
          error={"error string"}
          min={config.min}
          max={config.max}
          onChange={handleSetValue}
        />
      ))}
    </>
  );
};

export default CartesianForm;
