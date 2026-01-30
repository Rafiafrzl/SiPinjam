import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  theme = "light",
  zIndex,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full mx-4",
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: zIndex || 9999 }}
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Background dark overlay */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div
          className={`
          relative rounded-lg shadow-xl
          transform transition-all
          w-full max-h-[90vh] overflow-y-auto
          ${sizeClasses[size]}
          ${theme === "dark"
              ? "bg-neutral-900 border border-white/10"
              : "bg-white"}
        `}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`sticky top-0 px-6 py-4 z-10 ${theme === "dark"
              ? "bg-neutral-900 border-b border-white/10"
              : "bg-white border-b border-gray-200"
              }`}>
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`ml-3 focus:outline-none focus:ring-2 rounded-lg p-1 ${theme === "dark"
                      ? "text-gray-400 hover:text-gray-200 focus:ring-cyan-500"
                      : "text-gray-400 hover:text-gray-600 focus:ring-blue-500"
                      }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
