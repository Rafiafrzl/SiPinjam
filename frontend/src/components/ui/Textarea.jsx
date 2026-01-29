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
          ${error ? 'border-red-500 focus:ring-red-500/20' : 'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
          focus:outline-none
          disabled:cursor-not-allowed
          ${className || 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
