import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';

interface MobileNumberInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  labelClassName = '',
  placeholder = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string for clearing the input
    if (newValue === '') {
      setInputValue('');
      return;
    }
    
    // Only update if it's a valid number
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      setInputValue(newValue);
      
      // Only call onChange if the value is within bounds
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    // If empty, set to min value
    if (inputValue === '') {
      setInputValue(min.toString());
      onChange(min);
      return;
    }
    
    // Ensure value is within bounds
    const numValue = parseFloat(inputValue);
    if (numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      // Ensure we're using the parsed number
      onChange(numValue);
    }
  };

  const increment = () => {
    const currentValue = inputValue === '' ? min - step : parseFloat(inputValue);
    const newValue = Math.min(max, currentValue + step);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const decrement = () => {
    const currentValue = inputValue === '' ? min + step : parseFloat(inputValue);
    const newValue = Math.max(min, currentValue - step);
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className={`text-white font-medium ${labelClassName}`}>{label}</Label>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={disabled || parseFloat(inputValue || min.toString()) <= min}
          className="h-10 w-10 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="bg-gray-800 border-gray-600 text-white text-center h-10"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={disabled || parseFloat(inputValue || max.toString()) >= max}
          className="h-10 w-10 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileNumberInput;