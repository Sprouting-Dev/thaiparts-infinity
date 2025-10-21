'use client';

import { useState } from 'react';
import { BsCaretDownFill } from 'react-icons/bs';
import { getButtonStyle, getButtonClassName } from '@/lib/button-styles';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface ProductFilterProps {
  options?: FilterOption[];
  selectedOption?: string;
  onOptionSelect?: (optionId: string) => void;
  className?: string;
}

const defaultOptions: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'spare-parts', label: 'Spare Part' },
  { id: 'plc-scada', label: 'PLC/SCADA/Automation' },
  { id: 'instrumentation', label: 'Instrumentation & Measurement' }
];

export const ProductFilter = ({ 
  options = defaultOptions,
  selectedOption = 'all',
  onOptionSelect,
  className = ""
}: ProductFilterProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const buttonStyle = getButtonStyle('primary');
  const buttonClassName = getButtonClassName('primary');

  const fixedDisplayText = "All";

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (optionId: string) => {
    setIsDropdownOpen(false);
    if (onOptionSelect) {
      onOptionSelect(optionId);
    }
  };

  const handleClickOutside = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        className={`${buttonClassName} !py-2 !px-3 text-sm lg:text-[1rem] font-medium gap-3 hover:bg-opacity-80 transition-all duration-200 cursor-pointer relative`}
        style={{
          backgroundColor: buttonStyle.bg,
          color: buttonStyle.color,
          boxShadow: buttonStyle.boxShadow,
          textShadow: buttonStyle.textShadow,
        }}
        onClick={toggleDropdown}
      >
        <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
        <span>{fixedDisplayText}</span>
        <BsCaretDownFill 
          className={`w-4 h-4 transition-transform duration-300 ${
            isDropdownOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={handleClickOutside}
          />
          
          <div 
            className="absolute top-full right-0 mt-2 w-70 lg:w-86 bg-white rounded-2xl shadow-xl overflow-hidden z-20"
            style={{
              background: 'linear-gradient(180deg, #CCE8FF 0%, #1063A7 100%)',
              padding: '2px'
            }}
          >
            <div className="bg-white rounded-2xl">
              {options.map((option, index) => (
                <div key={option.id}>
                  <button
                    className="cursor-pointer w-full text-left px-4 py-3 flex items-center gap-3"
                  onClick={() => handleOptionSelect(option.id)}
                >
                  {option.id === selectedOption ? (
                    <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full flex-shrink-0"></span>
                  ) : (
                    <span className="w-2 h-2 flex-shrink-0"></span> 
                  )}
            
                  <span className="text-sm lg:text-[1rem] font-medium text-primary">
                    {option.label}
                  </span>
             
                  {option.count && (
                    <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  )}
                </button>
             
                  {index < options.length - 1 && (
                    <div className="mx-6 border-b border-[rgba(16,99,167,0.25)]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};