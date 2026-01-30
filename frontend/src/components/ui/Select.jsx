const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  placeholder = 'Pilih...',
  className = '',
  theme = 'light', // 'light' or 'dark'
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'
          }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200
          ${theme === 'dark'
            ? 'bg-neutral-800 border-white/10 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
            : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
          }
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
