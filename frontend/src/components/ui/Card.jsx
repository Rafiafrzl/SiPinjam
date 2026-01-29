const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'hover:shadow-lg transition-all duration-300 cursor-pointer' : 'transition-all duration-300';

  // Check if custom background is provided
  const hasCustomBg = className.includes('bg-') || className.includes('!bg-');
  const bgClass = hasCustomBg ? '' : 'bg-white/80 backdrop-blur-sm';
  const borderClass = hasCustomBg && className.includes('text-white') ? 'border-white/20' : 'border-white/50';

  return (
    <div
      className={`${bgClass} rounded-xl shadow-sm border ${borderClass} p-6 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`text-xl font-semibold text-gray-800 ${className}`}>{children}</h3>;
};

const CardContent = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
