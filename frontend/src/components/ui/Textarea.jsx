const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none
          bg-neutral-800 border-neutral-700 text-white placeholder-gray-500
          ${error ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'}
          focus:outline-none
          disabled:bg-neutral-900 disabled:text-gray-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
