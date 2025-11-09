import React from 'react';

/**
 * Reusable Card component for displaying content in a box with optional header, footer, and variants
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} [props.header] - Card header content
 * @param {React.ReactNode} props.children - Card body content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {string} [props.variant='default'] - Card variant (default, outlined, elevated)
 * @param {boolean} [props.isHoverable=false] - Whether card should have hover effect
 * @param {string} [props.className] - Additional CSS classes for the card container
 * @param {string} [props.bodyClassName] - Additional CSS classes for the card body
 * @param {string} [props.headerClassName] - Additional CSS classes for the card header
 * @param {string} [props.footerClassName] - Additional CSS classes for the card footer
 */
const Card = ({
  header,
  children,
  footer,
  variant = 'default',
  isHoverable = false,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  ...rest
}) => {
  // Base styles always applied
  const baseStyles = 'rounded-lg overflow-hidden';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white shadow',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-lg',
  };
  
  // Hover effect
  const hoverStyles = isHoverable 
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' 
    : '';

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} 
      {...rest}
    >
      {header && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {header}
        </div>
      )}
      
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
