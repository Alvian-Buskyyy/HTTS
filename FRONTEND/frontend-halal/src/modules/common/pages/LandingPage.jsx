import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingPageCSS from '../../common/components/LandingPageCSS';
import LoginModal from '../../auth/components/LoginModal';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('background');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Tab functionality
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Filter functionality for partners
  const handleFilterClick = (filterValue) => {
    setActiveFilter(filterValue);
  };

  // Smooth scrolling for anchor links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
    setShowMobileMenu(false);
  };

  // Add scroll event listener to update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset to trigger section change earlier
      
      // Get all section elements
      const sections = ['about', 'features', 'partners', 'contact'].map(id => document.getElementById(id));
      
      // Find the current section in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <LandingPageCSS />
      <div className="landing-page">
        {/* Header */}
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src="/img/logo.png" alt="Logo" className="h-10 mr-3" />
                <h1 className="text-xl font-bold text-primary hidden md:block">Halalan Thoyyiban Traceability System</h1>
                <h1 className="text-xl font-bold text-primary md:hidden">HTTS</h1>
              </div>
              
              {/* Navigation for desktop */}
              <nav className="hidden md:flex space-x-1">
                <button 
                  onClick={() => scrollToSection('about')}
                  className={`px-4 py-2 rounded-md ${activeSection === 'about' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Tentang
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className={`px-4 py-2 rounded-md ${activeSection === 'features' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Fitur
                </button>
                <button 
                  onClick={() => scrollToSection('partners')}
                  className={`px-4 py-2 rounded-md ${activeSection === 'partners' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Mitra
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className={`px-4 py-2 rounded-md ${activeSection === 'contact' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Kontak
                </button>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                >
                  Login
                </button>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primaryLight transition"
                >
                  Daftar
                </Link>
              </nav>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primaryDark mr-2"
                >
                  Login
                </button>
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)} 
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showMobileMenu ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Mobile menu */}
            {showMobileMenu && (
              <nav className="md:hidden mt-3 pb-3">
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => scrollToSection('about')}
                    className={`px-4 py-2 rounded-md text-left ${activeSection === 'about' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Tentang
                  </button>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className={`px-4 py-2 rounded-md text-left ${activeSection === 'features' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Fitur
                  </button>
                  <button 
                    onClick={() => scrollToSection('partners')}
                    className={`px-4 py-2 rounded-md text-left ${activeSection === 'partners' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Mitra
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className={`px-4 py-2 rounded-md text-left ${activeSection === 'contact' ? 'bg-primaryLight text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Kontak
                  </button>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 border border-primary text-primary rounded-md text-center hover:bg-primaryLight transition"
                  >
                    Daftar
                  </Link>
                </div>
              </nav>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-28 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  Sistem Penelusuran <span className="text-primary">Halalan Thoyyiban</span> Berbasis Blockchain
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Pastikan setiap daging yang Anda konsumsi terjamin kehalalannya dan kualitasnya melalui sistem penelusuran yang transparan, aman, dan terpercaya.
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowLoginModal(true)} 
                    className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primaryDark transition"
                  >
                    Mulai Sekarang
                  </button>
                  <button 
                    onClick={() => scrollToSection('about')} 
                    className="px-6 py-3 border border-primary text-primary rounded-md hover:bg-primaryLight transition"
                  >
                    Pelajari Lebih Lanjut
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img src="/img/hero-image.png" alt="Halal Traceability" className="mx-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* Rest of the component would be here */}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default LandingPage;
