import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UseFormRegister, UseFormSetValue, FieldPath, FieldValues } from 'react-hook-form';
import './SearchableSelect.css';

interface Option {
  id: string;
  name: string;
  [key: string]: any; // Allow additional properties
}

interface ScoredOption extends Option {
  score: number;
  matchType: 'exact' | 'prefix' | 'contains' | 'fuzzy';
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

// Scoring algorithm for predictive matching
const scoreOptions = (options: Option[], searchTerm: string): ScoredOption[] => {
  return options
    .map(option => {
      const name = option.name.toLowerCase();
      const search = searchTerm.toLowerCase().trim();
      
      let score = 0;
      let matchType: 'exact' | 'prefix' | 'contains' | 'fuzzy' = 'fuzzy';
      
      if (!searchTerm.trim()) {
        // No search term - all options have neutral score
        score = 0;
        matchType = 'exact';
      } else if (name === search) {
        score = 1000; // Exact match - highest priority
        matchType = 'exact';
      } else if (name.startsWith(search)) {
        score = 500 + (search.length / name.length) * 100; // Prefix match
        matchType = 'prefix';
      } else if (name.includes(search)) {
        score = 250 + (search.length / name.length) * 50; // Contains match
        matchType = 'contains';
      } else {
        // Simple fuzzy matching - count matching characters
        let matches = 0;
        let searchIndex = 0;
        for (let i = 0; i < name.length && searchIndex < search.length; i++) {
          if (name[i] === search[searchIndex]) {
            matches++;
            searchIndex++;
          }
        }
        score = (matches / search.length) * 100;
        matchType = 'fuzzy';
      }
      
      return { ...option, score, matchType };
    })
    // Always show ALL options - just sort by relevance
    .sort((a, b) => {
      // If no search term, maintain original order
      if (!searchTerm.trim()) return 0;
      // Otherwise sort by score (best matches first)
      return b.score - a.score;
    });
};

// Helper to find next focusable element
const focusNextField = (currentElement: HTMLInputElement) => {
  const form = currentElement.closest('form');
  if (!form) return false;
  
  const focusableElements = Array.from(form.querySelectorAll(
    'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
  )) as HTMLElement[];
  
  const currentIndex = focusableElements.indexOf(currentElement);
  const nextElement = focusableElements[currentIndex + 1];
  
  if (nextElement) {
    setTimeout(() => nextElement.focus(), 0); // Delay to ensure current state is updated
    return true;
  }
  return false;
};

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [predictedOption, setPredictedOption] = useState<ScoredOption | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize scored options to prevent infinite re-renders
  const scoredOptions = useMemo(() => scoreOptions(options, searchTerm), [options, searchTerm]);

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

  // Auto-predict best match when search term changes
  useEffect(() => {
    if (searchTerm.trim() && scoredOptions.length > 0) {
      const bestMatch = scoredOptions[0];
      // Only predict if there's a meaningful match (score > 0 means some relevance)
      if (bestMatch.score > 0) {
        setPredictedOption(bestMatch);
        setHighlightedIndex(0);
      } else {
        setPredictedOption(null);
        setHighlightedIndex(-1);
      }
    } else {
      setPredictedOption(null);
      setHighlightedIndex(-1); // No highlight when not searching
    }
  }, [searchTerm, options]); // Remove scoredOptions from deps since it's memoized from searchTerm + options

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setPredictedOption(null);
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setDisplayValue(newSearchTerm);
    setIsOpen(true);

    // If search term is empty, clear selection
    if (!newSearchTerm.trim()) {
      setValue(name, '' as any, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      onSelectionChange?.('', null);
    }
  };

  const handleOptionClick = (option: ScoredOption) => {
    setValue(name, option.id as any, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setDisplayValue(option.name);
    setSearchTerm(option.name);
    setIsOpen(false);
    onSelectionChange?.(option.id, option);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const selectCurrentOption = () => {
    let optionToSelect: ScoredOption | null = null;

    if (highlightedIndex >= 0 && highlightedIndex < scoredOptions.length) {
      optionToSelect = scoredOptions[highlightedIndex];
    } else if (predictedOption) {
      optionToSelect = predictedOption;
    }

    if (optionToSelect) {
      handleOptionClick(optionToSelect);
      return true;
    }
    return false;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        if (selectCurrentOption() && e.key === 'Tab') {
          // Move to next field after selection
          if (inputRef.current) {
            focusNextField(inputRef.current);
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => {
          const newIndex = Math.min(prev + 1, scoredOptions.length - 1);
          return newIndex >= 0 ? newIndex : 0;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;

      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Reset to current selected value
        if (value) {
          const selectedOption = options.find(option => option.id === value);
          if (selectedOption) {
            setSearchTerm(selectedOption.name);
            setDisplayValue(selectedOption.name);
          }
        } else {
          setSearchTerm('');
          setDisplayValue('');
        }
        inputRef.current?.blur();
        break;

      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setHighlightedIndex(scoredOptions.length - 1);
        break;
    }
  };

  // Helper to render highlighted text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} className="match-highlight">{part}</mark>
            : part
        )}
      </>
    );
  };

  return (
    <div className="searchable-select-container" ref={dropdownRef}>
      <label className="searchable-select-label">{label}</label>
      
      {/* Hidden input for react-hook-form registration */}
      <input
        type="hidden"
        {...register(name)}
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
            {scoredOptions.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isPredicted = predictedOption && option.id === predictedOption.id && index === 0 && searchTerm.trim();
              const isSelected = option.id === value;
              
              return (
                <div
                  key={option.id}
                  className={`
                    searchable-select-option 
                    ${isHighlighted ? 'highlighted' : ''} 
                    ${isPredicted ? 'predicted' : ''}
                    ${isSelected ? 'selected' : ''}
                    ${searchTerm.trim() ? `match-${option.matchType}` : ''}
                  `.trim()}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {searchTerm.trim() ? renderHighlightedText(option.name, searchTerm) : option.name}
                  {isPredicted && <span className="prediction-indicator">⏎</span>}
                </div>
              );
            })}
            {scoredOptions.length === 0 && (
              <div className="searchable-select-no-options">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}