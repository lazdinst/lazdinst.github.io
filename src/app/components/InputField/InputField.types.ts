import { FormKeys } from "../../../definitions";

export interface InputFormField {
  id: FormKeys;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  error: string;
  onChange: (id: FormKeys, value: number) => void;
  type: string;
}
