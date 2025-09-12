import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, FieldPath, FieldValues } from 'react-hook-form';
import './SearchableSelect.css';

interface Option {
  id: string;
  name: string;
  [key: string]: any; // Allow additional properties
}

interface SearchableSelectProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  disabled?: boolean;
  register: UseFormRegister<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  onSelectionChange?: (selectedValue: string, selectedOption: Option | null) => void;
}

export function SearchableSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  placeholder = `Select ${label}`,
  options,
  value = '',
  disabled = false,
  register,
  setValue,
  onSelectionChange,
}: SearchableSelectProps<TFieldValues>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.id === value);
      setDisplayValue(selectedOption?.name || '');
      setSearchTerm(selectedOption?.name || '');
    } else {
      setDisplayValue('');
      setSearchTerm('');
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to selected value if nothing was selected
        if (value) {
          const selectedOption = options.find(option => option.id === value);
          setSearchTerm(selectedOption?.name || '');
          setDisplayValue(selectedOption?.name || '');
        } else {
          setSearchTerm('');
          setDisplayValue('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setDisplayValue(newSearchTerm);
    setIsOpen(true);

    // If search term is empty, clear selection
    if (!newSearchTerm) {
      setValue(name, '' as any);
      onSelectionChange?.('', null);
    }
  };

  const handleOptionClick = (option: Option) => {
    setValue(name, option.id as any);
    setDisplayValue(option.name);
    setSearchTerm(option.name);
    setIsOpen(false);
    onSelectionChange?.(option.id, option);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleOptionClick(filteredOptions[0]);
      }
    } else if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
      e.preventDefault();
      // Focus first option - could enhance with keyboard navigation
      setIsOpen(true);
    }
  };

  return (
    <div className="searchable-select-container" ref={dropdownRef}>
      <label className="searchable-select-label">{label}</label>
      
      {/* Hidden input for react-hook-form registration */}
      <input
        type="hidden"
        {...register(name)}
        value={value}
      />
      
      <div className={`searchable-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="searchable-select-input"
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
        />
        
        <div className="searchable-select-arrow">
          <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="searchable-select-dropdown">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`searchable-select-option ${option.id === value ? 'selected' : ''}`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="searchable-select-no-options">
                No options found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}