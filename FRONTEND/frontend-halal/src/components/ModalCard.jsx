import React from 'react';

/**
 * ModalCard - A reusable modal component with semi-transparent background
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls whether the modal is visible or not
 * @param {function} props.onClose - Function to call when the modal should close
 * @param {string} props.title - Title to display at the top of the modal
 * @param {React.ReactNode} props.children - Content to display in the modal body
 * @param {string} props.size - Size of the modal: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {boolean} props.showCloseButton - Whether to show the close button (default: true)
 * @param {React.ReactNode} props.footer - Optional footer content
 * @returns {React.ReactNode}
 */
const ModalCard = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  showCloseButton = true,
  footer
}) => {
  if (!isOpen) return null;

  // Size classes for the modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle background click
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key press
  React.useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackgroundClick}
    >
      <div 
        className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-xl transform transition-all duration-300 scale-100 opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {showCloseButton && (
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Modal Footer (optional) */}
        {footer && (
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCard;
