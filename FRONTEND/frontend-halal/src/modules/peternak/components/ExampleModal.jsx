import React, { useState } from 'react';
import ModalCard from '../../../components/ModalCard';

/**
 * Example component showing how to use the ModalCard component
 */
const ExampleModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('md');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const openModal = (size = 'md') => {
    setSelectedSize(size);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Form submitted successfully!');
      closeModal();
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    }, 500);
  };

  // Custom footer for the modal with submit and cancel buttons
  const modalFooter = (
    <div className="flex justify-end space-x-2">
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={closeModal}
      >
        Cancel
      </button>
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );

  return (
    <div>
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Modal Card Examples</h2>
        <p className="text-gray-600">
          Click on the buttons below to see different sizes of the modal card component.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            onClick={() => openModal('sm')}
          >
            Small Modal
          </button>
          
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            onClick={() => openModal('md')}
          >
            Medium Modal (Default)
          </button>
          
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            onClick={() => openModal('lg')}
          >
            Large Modal
          </button>
          
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
            onClick={() => openModal('xl')}
          >
            Extra Large Modal
          </button>
        </div>
      </div>
      
      {/* Modal Card Component */}
      <ModalCard 
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Example Form"
        size={selectedSize}
        footer={modalFooter}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          {/* No need for submit button here as it's in the footer */}
        </form>
      </ModalCard>
    </div>
  );
};

export default ExampleModal;
