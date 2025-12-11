import React, { useState, useEffect } from "react";

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "0",
  required = false,
  disabled = false,
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Update display when value prop changes
  useEffect(() => {
    if (value !== "") {
      const numValue = typeof value === "string" ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        setDisplayValue(formatNumberWithDots(numValue));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  // Format number with dots (e.g., 1000000 -> 1.000.000)
  const formatNumberWithDots = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Remove dots and convert to number
  const parseNumberFromDisplay = (str: string): number => {
    const cleaned = str.replace(/\D/g, "");
    return cleaned === "" ? 0 : parseInt(cleaned, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = parseNumberFromDisplay(inputValue);

    // Update display with formatted number
    if (inputValue === "") {
      setDisplayValue("");
      onChange(0);
    } else {
      setDisplayValue(formatNumberWithDots(numValue));
      onChange(numValue);
    }
  };

  return (
    <div className={className}>
      {label && <label className="text-sm text-white/80 block mb-2">{label}</label>}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <p className="text-xs text-slate-400 mt-1">Raw value: {typeof value === "string" ? parseInt(value, 10) : value} IDR</p>
    </div>
  );
};

export default CurrencyInput;
