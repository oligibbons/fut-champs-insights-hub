import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface NumberInputWithStepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

export const NumberInputWithStepper = ({ value, onValueChange, min = 0, max, label }: NumberInputWithStepperProps) => {
  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onValueChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (min === undefined || value > min) {
      onValueChange(value - 1);
    }
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
        >
          <Minus className="h-6 w-6" />
        </Button>
        <Input
          type="number"
          className="h-20 w-24 text-center text-5xl font-bold border-0 bg-transparent shadow-none focus-visible:ring-0"
          value={value}
          onChange={(e) => onValueChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
