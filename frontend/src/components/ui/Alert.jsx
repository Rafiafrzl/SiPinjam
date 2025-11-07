import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoCloseCircle, IoClose } from 'react-icons/io5';

const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <IoCheckmarkCircle className="text-green-500" size={24} />
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <IoCloseCircle className="text-red-500" size={24} />
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: <IoWarning className="text-yellow-500" size={24} />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <IoInformationCircle className="text-blue-500" size={24} />
    }
  };

  const alertType = types[type];

  return (
    <div className={`border rounded-lg p-4 ${alertType.bg} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{alertType.icon}</div>
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${alertType.text} mb-1`}>{title}</h3>
          )}
          <p className={`text-sm ${alertType.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${alertType.text} hover:opacity-70`}
          >
            <IoClose size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
