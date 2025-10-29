import React, { useState, useEffect } from 'react'; // Added React import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label'; // Kept Label import

interface MobileNumberInputProps {
  label?: string; // Keep optional label
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  decimals?: number;
}

const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100, // Default based on previous context
  step = 1,
  className = '',
  labelClassName = '',
  placeholder = '',
  disabled = false,
  decimals = 0
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    // Update input value if the prop changes from outside
    const currentNumValue = parseFloat(inputValue);
    const propNumValue = parseFloat(String(value));
    // Check if values are different or if input is NaN but prop is not
    if (isNaN(currentNumValue) || Math.abs(currentNumValue - propNumValue) > 1e-6) {
        setInputValue(value.toString());
    }
    // Also handle case where prop becomes empty/invalid, reset input?
    // Or assume prop 'value' is always controlled and valid.
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty string or just "-" for typing
    if (newValue === '' || (newValue === '-' && min !== undefined && min < 0)) {
      setInputValue(newValue);
      // Potentially call onChange with 0 or min if that's desired behavior on empty
      // onChange(min !== undefined ? min : 0); // Uncomment if needed
      return;
    }

    // Regex to match valid numbers (potentially negative, potentially decimal)
    const regex = decimals > 0
      ? new RegExp(`^-?\\d*\\.?\\d{0,${decimals}}$`)
      : /^-?\d*$/;

    if (regex.test(newValue)) {
      setInputValue(newValue);
      // Optional: Try parsing and calling onChange immediately for responsiveness
      // const numValue = parseFloat(newValue);
      // if (!isNaN(numValue)) {
      //   onChange(numValue); // Be careful with intermediate invalid states
      // }
    }
  };

  const handleBlur = () => {
    let finalValue: number;
    const numValue = parseFloat(inputValue);

    if (inputValue === '' || inputValue === '-' || isNaN(numValue)) {
      // If empty, NaN, or just '-', default to min (or 0 if min undefined)
      finalValue = min !== undefined ? min : 0;
    } else {
      // Clamp the parsed number
      const clamped = Math.max(min !== undefined ? min : -Infinity, Math.min(max !== undefined ? max : Infinity, numValue));
      // Format according to decimals
      finalValue = decimals > 0 ? parseFloat(clamped.toFixed(decimals)) : Math.round(clamped);
    }

    // Update the input display to the cleaned value
    setInputValue(finalValue.toString());

    // Call onChange ONLY if the final calculated value differs from the original prop value
    // to avoid unnecessary updates/re-renders if the user just blurs without changing.
    const propNumValue = parseFloat(String(value));
    if (isNaN(propNumValue) || Math.abs(propNumValue - finalValue) > 1e-6) {
      onChange(finalValue);
    }
  };


  const increment = () => {
    // Use current prop value as base for calculation for consistency
    const currentValue = parseFloat(String(value));
    const baseValue = isNaN(currentValue) ? (min !== undefined ? min : 0) : currentValue;
    const newValue = Math.min(max !== undefined ? max : Infinity, baseValue + step);
    const formattedValue = decimals > 0 ? parseFloat(newValue.toFixed(decimals)) : Math.round(newValue);
    setInputValue(formattedValue.toString()); // Update local display immediately
    onChange(formattedValue); // Update parent state
  };

  const decrement = () => {
    // Use current prop value as base
    const currentValue = parseFloat(String(value));
     const baseValue = isNaN(currentValue) ? (min !== undefined ? min : 0) : currentValue;
    const newValue = Math.max(min !== undefined ? min : -Infinity, baseValue - step);
    const formattedValue = decimals > 0 ? parseFloat(newValue.toFixed(decimals)) : Math.round(newValue);
    setInputValue(formattedValue.toString()); // Update local display immediately
    onChange(formattedValue); // Update parent state
  };

  // Determine current numeric value for disabling buttons accurately
  const currentNumericValue = parseFloat(inputValue);
  const isValidNumber = !isNaN(currentNumericValue);

  return (
    <div className={`space-y-1 ${className}`}> {/* Reduced space-y if needed */}
      {label && (
        <Label className={`text-xs text-white ${labelClassName}`}>{label}</Label> // Smaller label?
      )}
      <div className="flex items-center gap-1"> {/* Reduced gap */}
        <Button
          type="button" // Important for forms
          variant="outline"
          size="icon"
          // --- FIX: Smaller button ---
          className="h-8 w-8 p-1 shrink-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 static-element" // Combined styles
          onClick={decrement}
          disabled={disabled || !isValidNumber || (min !== undefined && currentNumericValue <= min)}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="text" // Use text to allow intermediate states
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          // --- FIX: Narrower input ---
          className="h-8 w-12 text-center px-1 bg-gray-800 border-gray-600 text-white mobile-friendly-input" // Combined styles
          min={min} // Keep browser hints
          max={max}
          step={step}
        />

        <Button
          type="button" // Important for forms
          variant="outline"
          size="icon"
           // --- FIX: Smaller button ---
          className="h-8 w-8 p-1 shrink-0 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 static-element" // Combined styles
          onClick={increment}
          disabled={disabled || !isValidNumber || (max !== undefined && currentNumericValue >= max)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileNumberInput;