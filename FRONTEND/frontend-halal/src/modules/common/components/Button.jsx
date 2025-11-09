import React from 'react';

/**
 * Reusable Button component with various variants and sizes
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, outline, danger, success)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isFullWidth=false] - Whether button should take full width
 * @param {boolean} [props.isDisabled=false] - Whether button is disabled
 * @param {boolean} [props.isLoading=false] - Whether button is in loading state
 * @param {Function} [props.onClick] - Button click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md',
  isFullWidth = false,
  isDisabled = false,
  isLoading = false,
  onClick,
  children,
  className = '',
  ...rest
}) => {
  // Base styles always applied
  const baseStyles = 'font-medium rounded-md focus:outline-none transition-all duration-200';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primaryDark',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primaryLight',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Width styles
  const widthStyles = isFullWidth ? 'w-full' : '';
  
  // Disabled and loading styles
  const stateStyles = isDisabled || isLoading 
    ? 'opacity-60 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${stateStyles} ${className}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
