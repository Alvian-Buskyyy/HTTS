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
      
      .text-justify {
        text-align: justify;
      }
      
      .font-larger {
        font-size: 1.1rem;
      }
      
      .heading-larger {
        font-size: 2.5rem;
      }
      
      .subheading-larger {
        font-size: 1.75rem;
      }
      
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .partner-logo {
        filter: grayscale(100%);
        opacity: 0.6;
        transition: all 0.3s ease;
      }
      
      .partner-logo:hover {
        filter: grayscale(0);
        opacity: 1;
      }
      
      .tab-content {
        animation: fadeIn 0.5s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Color classes to match the HTML version */
      .bg-primary { background-color: #2a9df4; }
      .bg-primaryDark { background-color: #1a7bc9; }
      .bg-primaryLight { background-color: #e6f3fd; }
      .text-primary { color: #2a9df4; }
      .border-primary { border-color: #2a9df4; }
      
      .bg-yellow-500 { background-color: #f59e0b; }
      .bg-red-500 { background-color: #ef4444; }
      .bg-indigo-500 { background-color: #6366f1; }
      .bg-green-500 { background-color: #10b981; }
      
      .qr-code {
        width: 150px;
        height: 150px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);

    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default LandingPageCSS;
