'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DataTypePickerProps {
  value: string;
  onChange: (type: string) => void;
  // onSave now commits the chosen value directly
  onSave: (value: string) => void;
  onCancel: () => void;
}

const DATA_TYPES = [
  // String types
  'string', 'text', 'varchar', 'char', 'nvarchar', 'nchar',
  // Number types
  'int', 'integer', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'double', 'real',
  // Date/Time types
  'date', 'time', 'datetime', 'timestamp',
  // Boolean type
  'boolean', 'bit',
  // Binary types
  'binary', 'varbinary', 'blob',
  // JSON type
  'json', 'jsonb',
  // UUID type
  'uuid'
];

export const DataTypePicker: React.FC<DataTypePickerProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
}) => {
  const [isOpen, setIsOpen] = useState(true); // Auto-open on mount
  const [customValue, setCustomValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Guard against blur firing a second save while we're committing a click
  const committingRef = useRef(false);

  // Filter data types based on input
  const filteredTypes = DATA_TYPES.filter(type => 
    type.toLowerCase().includes(customValue.toLowerCase())
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownListRef.current) {
      const selectedElement = dropdownListRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTypeSelect = (type: string) => {
    console.log('DataTypePicker - Selecting type:', type);
    console.log('DataTypePicker - committingRef before:', committingRef.current);
    committingRef.current = true;
    setCustomValue(type);
    onChange(type);
    setIsOpen(false);
    // Commit immediately with the chosen type
    console.log('DataTypePicker - Calling onSave with:', type);
    onSave(type);
    // Keep the commit flag set slightly longer than blur timeout
    setTimeout(() => { 
      console.log('DataTypePicker - Resetting committingRef');
      committingRef.current = false; 
    }, 250);
  };  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
    setSelectedIndex(-1); // Reset selection when typing
    // Auto-open dropdown when typing
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredTypes.length) {
        // Select highlighted option
        handleTypeSelect(filteredTypes[selectedIndex]);
      } else {
        // Save current input value
        onChange(customValue);
        onSave(customValue);
      }
    } else if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex(prev => 
        prev < filteredTypes.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredTypes.length - 1
      );
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    console.log('DataTypePicker - Input blur, committingRef:', committingRef.current);
    // Delay the blur to allow dropdown clicks
    setTimeout(() => {
      console.log('DataTypePicker - Blur timeout, committingRef:', committingRef.current);
      if (committingRef.current) {
        console.log('DataTypePicker - Skipping blur save due to active commit');
        return; // A click already committed the value
      }
      if (!dropdownRef.current?.contains(document.activeElement)) {
        console.log('DataTypePicker - Executing blur save with value:', customValue.trim() || value);
        // If no value entered, use previous value
        if (!customValue.trim()) {
          setCustomValue(value);
          onChange(value);
        }
        onSave(customValue.trim() || value);
      } else {
        console.log('DataTypePicker - Focus still within dropdown, skipping blur save');
      }
    }, 200); // Increased delay for better click handling
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <input
          ref={inputRef}
          value={customValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          className="bg-blue-100 text-gray-900 px-2 py-0.5 rounded text-xs w-20 pr-6"
          placeholder="Type..."
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 p-0.5 hover:bg-blue-200 rounded transition-colors"
        >
          <ChevronDown size={10} />
        </button>
      </div>
      
      {isOpen && (
        <div 
          ref={dropdownListRef}
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[60] min-w-[100px] max-h-28 overflow-y-auto"
        >
          {filteredTypes.map((type, index) => (
            <button
              key={type}
              onMouseDown={(e) => {
                console.log('DataTypePicker - MouseDown on:', type);
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                console.log('DataTypePicker - MouseUp on:', type);
                e.preventDefault();
                e.stopPropagation();
                handleTypeSelect(type);
              }}
              onClick={(e) => {
                console.log('DataTypePicker - Click on:', type);
                e.preventDefault();
                e.stopPropagation();
                handleTypeSelect(type);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`block w-full text-left px-2 py-1 text-xs transition-colors border-b border-gray-50 last:border-b-0 focus:outline-none ${
                index === selectedIndex 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'hover:bg-blue-50'
              }`}
            >
              <span className="font-mono">{type}</span>
            </button>
          ))}
          {filteredTypes.length === 0 && (
            <div className="px-2 py-1 text-xs text-gray-500">No matching types</div>
          )}
        </div>
      )}
    </div>
  );
};
