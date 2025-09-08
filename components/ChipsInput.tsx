import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

export interface ChipsInputProps {
  placeholder?: string;
  value: string[];
  onChange: (chips: string[]) => void;
  className?: string;
}

export const ChipsInput = ({ placeholder, value, onChange, className }: ChipsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = (chip: string) => {
    const trimmedChip = chip.trim();
    if (trimmedChip && !value.includes(trimmedChip)) {
      onChange([...value, trimmedChip]);
    }
    setInputValue("");
  };

  const removeChip = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeChip(value.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addChip(inputValue);
    }
  };

  return (
    <div 
      className={`flex flex-wrap gap-2 p-2 rounded-md min-h-[48px] cursor-text ${className}`}
      onClick={() => inputRef.current?.focus()}
      style={{ 
        backgroundColor: 'var(--embed)',
        border: '2px solid transparent'
      }}
    >
      {value.map((chip, index) => (
        <div
          key={index}
          className="flex items-center gap-1 px-2 py-1 rounded text-sm font-medium"
          style={{ 
            backgroundColor: 'var(--highlight)', 
            color: 'var(--foreground)' 
          }}
        >
          <span>{chip}</span>
          <button
            type="button"
            onClick={() => removeChip(index)}
            className="hover:opacity-70 rounded p-1 min-w-0 flex items-center justify-center"
            aria-label={`Remove ${chip}`}
            style={{ 
              backgroundColor: 'transparent',
              border: 'none',
              padding: '2px'
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] outline-none bg-transparent border-0 p-1"
        style={{ 
          minWidth: Math.max(120, inputValue.length * 8),
          color: 'var(--foreground)',
          fontSize: '0.95rem',
          fontWeight: '600',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );
};