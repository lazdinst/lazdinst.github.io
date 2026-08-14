export interface NumericFieldProps {
  id: string;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  unit?: string;
  onChange: (id: string, value: number) => void;
}
