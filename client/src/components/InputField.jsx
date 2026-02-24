import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * InputField - Reusable form input component
 * 
 * Features:
 * - Text, number, and select inputs
 * - Inline validation with error display
 * - Icon support
 * - Unit suffix (e.g., cm, kg, mmHg)
 * - Helper text
 * - Controlled component support
 */

const InputField = ({
  // Basic props
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  
  // Icon
  icon: Icon,
  
  // Validation
  error,
  required = false,
  min,
  max,
  step,
  
  // Select options
  options = [],
  
  // Additional UI
  suffix,
  hint,
  disabled = false,
  
  // Styling
  className = '',
}) => {
  const baseInputClass = `
    w-full px-4 py-3 rounded-xl border 
    transition-all duration-200 
    bg-white text-gray-700
    focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-200 hover:border-gray-300'
    }
    ${suffix ? 'pr-16' : ''}
  `;

  const labelClass = `
    block text-sm font-semibold text-gray-700 mb-1.5
    ${required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
  `;

  const renderInput = () => {
    // Select input
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClass} cursor-pointer`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    // Standard input (text, number, etc.)
    return (
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={baseInputClass}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClass}>
          {Icon && <Icon className="w-4 h-4 inline mr-1.5 text-[#8B7FCF]" />}
          {label}
        </label>
      )}

      {/* Input */}
      {renderInput()}

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Hint Text */}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
};

/**
 * RadioGroup - Toggle option component
 * For binary choices like Yes/No, Active/Inactive
 */
export const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  hint,
  icon: Icon,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {Icon && <Icon className="w-4 h-4 inline mr-1.5 text-[#8B7FCF]" />}
          {label}
        </label>
      )}
      
      <div className="flex gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`
              flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 
              transition-all duration-200 font-medium text-sm
              ${value === opt.value
                ? `${opt.activeColor || 'border-purple-400 bg-purple-50 text-purple-700'}`
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="hidden"
            />
            {opt.icon && <opt.icon className="w-4 h-4" />}
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      
      {hint && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
};

/**
 * DisplayField - Read-only calculated field
 * Used for showing computed values like BMI
 */
export const DisplayField = ({
  label,
  value,
  suffix,
  status, // { label, color, bg }
  icon: Icon,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {Icon && <Icon className="w-4 h-4 inline mr-1.5 text-[#8B7FCF]" />}
          {label}
        </label>
      )}
      
      <div className={`px-4 py-3 rounded-xl border border-gray-200 ${status?.bg || 'bg-gray-50'}`}>
        <span className={`text-lg font-bold ${status?.color || 'text-gray-700'}`}>
          {value}
        </span>
        {suffix && (
          <span className="text-gray-400 text-sm ml-2">{suffix}</span>
        )}
      </div>
      
      {status?.label && (
        <p className={`text-xs mt-1 font-medium ${status.color}`}>
          {status.label}
        </p>
      )}
    </div>
  );
};

export default InputField;
