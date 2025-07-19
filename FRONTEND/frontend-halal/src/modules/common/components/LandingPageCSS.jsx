import React, { useEffect } from 'react';

const LandingPageCSS = () => {
  useEffect(() => {
    // Menambahkan Font Awesome jika belum ada
    if (!document.getElementById('font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
    
    // Menambahkan custom CSS untuk animasi dan interaksi
    const style = document.createElement('style');
    style.textContent = `
      .hero-bg {
        background: linear-gradient(rgba(42, 157, 244, 0.8), rgba(42, 157, 244, 0.9)), url('https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80');
        background-size: cover;
        background-position: center;
      }
      
      .container-wider,
      .max-w-7xl {
        width: 95%;
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .scroll-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .scroll-animate.active {
        opacity: 1;
        transform: translateY(0);
      }
      
      .feature-card {
        transition: all 0.3s ease;
      }
      
      .feature-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .partner-card {
        transition: all 0.3s ease;
      }
      
      .partner-card:hover {
        transform: scale(1.05);
      }
      
      .testimonial-card {
        transition: all 0.3s ease;
      }
      
      .testimonial-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .bg-primary { background-color: #2a9df4; }
      .bg-primaryDark { background-color: #1a7bc9; }
      .bg-primaryLight { background-color: #e6f3fd; }
      .text-primary { color: #2a9df4; }
      .hover\\:bg-primaryDark:hover { background-color: #1a7bc9; }
      .hover\\:bg-primaryLight:hover { background-color: #e6f3fd; }
      .hover\\:text-primary:hover { color: #2a9df4; }
      .focus\\:ring-primary:focus { --tw-ring-color: #2a9df4; }
      .focus\\:border-primary:focus { border-color: #2a9df4; }
      .hover\\:border-primary:hover { border-color: #2a9df4; }
      .border-primary { border-color: #2a9df4; }
      
      /* Animasi tambahan untuk landing page */
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .animate-pulse-slow {
        animation: pulse 3s ease-in-out infinite;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #2a9df4;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #1a7bc9;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};

export default LandingPageCSS;
