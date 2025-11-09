import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LandingPageCSS from '../components/LandingPageCSS';
import LoginModal from '../components/LoginModal';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('background');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [partnersStats, setPartnersStats] = useState({
    peternak: 0,
    pasarHewan: 0,
    jagal: 0,
    rph: 0,
    distributor: 0,
    horeka: 0,
    total: 0
  });
  
  // Tab functionality
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Filter functionality for partners
  const handleFilterClick = (filterValue) => {
    setActiveFilter(filterValue);
  };

  // Fetch partners from backend
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('http://localhost:3000/entities');
        if (!response.ok) {
          throw new Error('Failed to fetch partners');
        }
        const result = await response.json();
        if (result.success) {
          setPartners(result.data);
          setPartnersStats(result.count);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        // Keep mock data if API fails
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Semua fungsi login telah dipindahkan ke komponen LoginModal

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Partner data akan diambil dari backend (lihat useEffect)
  
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Peternakan Ahmad',
      role: 'Peternak Sapi',
      content: '"Sistem penelusuran telah membantu kami menunjukkan komitmen kami terhadap praktik halal dan terhubung langsung dengan pembeli yang sadar halal."'
    },
    {
      id: 2,
      name: 'Halal Meat Mart',
      role: 'Pengecer',
      content: '"Pelanggan kami senang dapat memindai kode QR dan melihat perjalanan halal lengkap dari daging yang mereka beli. Ini telah membangun kepercayaan yang luar biasa."'
    },
    {
      id: 3,
      name: 'Restoran Sakinah',
      role: 'HORECA',
      content: '"Menjadi bagian dari #TemanHalal telah membantu kami menarik pelanggan yang secara khusus mencari restoran dengan bahan-bahan halal terverifikasi."'
    }
  ];

  // Filter partners based on active filter
  const filteredPartners = partners.filter(partner => 
    activeFilter === 'all' || partner.type === activeFilter
  );

  // Close modal when clicking outside
  const modalRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLoginModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="font-sans relative antialiased text-gray-800">
      <LandingPageCSS />
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <i className="fas fa-shield-halved text-primary text-2xl mr-2"></i>
                <span className="text-xl font-bold text-primary">Halalan Thoyyiban</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <button 
                onClick={() => scrollToSection('about')} 
                className={`text-base relative ${activeSection === 'about' ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md font-medium`}
              >
                Tentang
                {activeSection === 'about' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className={`text-base relative ${activeSection === 'features' ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md font-medium`}
              >
                Fitur
                {activeSection === 'features' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
              <button 
                onClick={() => scrollToSection('partners')} 
                className={`text-base relative ${activeSection === 'partners' ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md font-medium`}
              >
                #TemanHalal
                {activeSection === 'partners' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className={`text-base relative ${activeSection === 'contact' ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md font-medium`}
              >
                Kontak
                {activeSection === 'contact' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
              </button>
            </div>
            <div className="flex items-center">
              <button onClick={() => setShowLoginModal(true)} className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Masuk</button>
              <Link to="/signup" className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-md text-sm font-medium ml-4">Daftar</Link>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-gray-900 hover:text-primary focus:outline-none">
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white pb-3 px-2">
            <button onClick={() => scrollToSection('about')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium relative ${activeSection === 'about' ? 'text-primary' : 'text-gray-900'} hover:text-primary hover:bg-primaryLight`}>
              Tentang
              {activeSection === 'about' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
            </button>
            <button onClick={() => scrollToSection('features')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium relative ${activeSection === 'features' ? 'text-primary' : 'text-gray-900'} hover:text-primary hover:bg-primaryLight`}>
              Fitur
              {activeSection === 'features' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
            </button>
            <button onClick={() => scrollToSection('partners')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium relative ${activeSection === 'partners' ? 'text-primary' : 'text-gray-900'} hover:text-primary hover:bg-primaryLight`}>
              #TemanHalal
              {activeSection === 'partners' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
            </button>
            <button onClick={() => scrollToSection('contact')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium relative ${activeSection === 'contact' ? 'text-primary' : 'text-gray-900'} hover:text-primary hover:bg-primaryLight`}>
              Kontak
              {activeSection === 'contact' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
            </button>
            <div className="pt-2 border-t border-gray-200">
              <button onClick={() => setShowLoginModal(true)} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary hover:bg-primaryLight">Masuk</button>
              <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primaryDark mt-1">Daftar</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-bg text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl md:text-7xl heading-larger font-bold leading-tight mb-6 text-left">Halalan Thoyyiban Traceability System</h1>
              <p className="text-lg md:text-xl mb-8 text-justify leading-snug tracking-wide">Integritas Halal Daging Sapi Terlindungi Sepanjang Rantai Pasok dengan Teknologi Pelacakan dan Verifikasi Digital.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/signup" className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-lg text-center transition duration-300">Mulai Sekarang</Link>
                <button onClick={() => scrollToSection('demo')} className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-6 rounded-lg text-center transition duration-300">Lihat Demo</button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white bg-opacity-20 rounded-full absolute -top-5 -left-5"></div>
                <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full absolute -bottom-5 -right-5"></div>
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-80 h-80">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-primary font-bold">Halalan Thoyyiban</span>
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">LIVE</span>
                    </div>
                    <div className="qr-code mb-4">
                      <i className="fas fa-qrcode text-6xl text-primary"></i>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 text-sm mb-1">Pindai untuk memverifikasi status halal</p>
                      <p className="text-primary font-bold">ID Potongan Daging: HT-789456</p>
                    </div>
                  </div>
                  <div className="bg-primaryLight p-3">
                    <div className="flex justify-between text-xs text-gray-700">
                      <div>
                        <p className="font-bold">Peternakan:</p>
                        <p>Peternakan Al-Falah</p>
                      </div>
                      <div>
                        <p className="font-bold">Penyembelihan:</p>
                        <p>12/06/2023</p>
                      </div>
                      <div>
                        <p className="font-bold">Status:</p>
                        <p className="text-green-600">Tersertifikasi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl heading-larger font-bold text-gray-900 mb-4">Tentang Sistem Kami</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4 text-left">Memastikan Integritas Halal dari Peternakan ke Konsumen</h3>
              <p className="text-gray-600 mb-4 text-justify font-larger">Sistem Penelusuran Halalan Thoyyiban kami dirancang untuk memberikan transparansi lengkap dalam rantai pasok daging sapi, memastikan setiap langkah dari peternakan hingga konsumen memenuhi persyaratan halal yang ketat.</p>
              <p className="text-gray-600 mb-6 text-justify font-larger">Dengan sistem kami, konsumen dapat memindai kode QR untuk mengakses informasi detail tentang asal, pemrosesan, dan distribusi produk daging mereka, memberikan keyakinan pada status halal makanan mereka.</p>
              <div className="flex space-x-4">
                <div className="bg-primaryLight p-4 rounded-lg">
                  <i className="fas fa-check-circle text-primary text-2xl mb-2"></i>
                  <p className="font-bold">Tersertifikasi Halal</p>
                </div>
                <div className="bg-primaryLight p-4 rounded-lg">
                  <i className="fas fa-shield-alt text-primary text-2xl mb-2"></i>
                  <p className="font-bold">Transparansi Penuh</p>
                </div>
                <div className="bg-primaryLight p-4 rounded-lg">
                  <i className="fas fa-leaf text-primary text-2xl mb-2"></i>
                  <p className="font-bold">Sumber Etis</p>
                </div>
              </div>
            </div>
            <div className="bg-primaryLight rounded-xl p-6">
              <div className="flex mb-4">
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'background' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
                  onClick={() => handleTabClick('background')}
                >
                  Latar Belakang
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'purpose' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
                  onClick={() => handleTabClick('purpose')}
                >
                  Tujuan
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'goals' ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'}`}
                  onClick={() => handleTabClick('goals')}
                >
                  Sasaran
                </button>
              </div>
              
              <div className={`tab-content ${activeTab === 'background' ? 'block' : 'hidden'}`} id="background">
                <p className="text-justify font-larger">Konsep Sistem Penelusuran Halalan Thoyyiban dibentuk untuk mengatasi kebutuhan yang semakin besar akan transparansi dan kepercayaan dalam rantai pasokan makanan halal. Dengan kesadaran dan permintaan yang meningkat untuk produk halal secara global, menjadi penting untuk menciptakan sistem yang memastikan dan memverifikasi integritas halal dari produk makanan, terutama daging.</p>
              </div>
              
              <div className={`tab-content ${activeTab === 'purpose' ? 'block' : 'hidden'}`} id="purpose">
                <p className="text-justify font-larger">Tujuan kami adalah menciptakan ekosistem terpercaya di mana semua pemangku kepentingan dalam rantai pasokan daging sapi halal dapat berkolaborasi untuk mempertahankan dan memverifikasi integritas halal. Kami bertujuan untuk menjembatani kesenjangan informasi antara produsen dan konsumen melalui teknologi.</p>
              </div>
              
              <div className={`tab-content ${activeTab === 'goals' ? 'block' : 'hidden'}`} id="goals">
                <ul className="list-disc pl-5 space-y-2 text-left">
                  <li>Membangun sistem penelusuran komprehensif untuk daging sapi halal</li>
                  <li>Meningkatkan kepercayaan konsumen pada produk halal</li>
                  <li>Mendukung pemangku kepentingan industri halal dengan alat digital</li>
                  <li>Mempromosikan praktik halal yang etis dan berkelanjutan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl heading-larger font-bold text-gray-900 mb-4">Fitur Sistem</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-search text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Pelacakan End-to-End</h3>
                <p className="text-gray-600">Lacak setiap langkah rantai pasok daging sapi dari peternakan hingga konsumen dengan buku besar digital komprehensif kami.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-qrcode text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Verifikasi Kode QR</h3>
                <p className="text-gray-600">Konsumen dapat memindai kode QR untuk memverifikasi status halal dan mengakses informasi produk secara detail secara instan.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-certificate text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Sertifikasi Halal</h3>
                <p className="text-gray-600">Sertifikasi digital terintegrasi dengan otoritas halal yang diakui untuk verifikasi otentik.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-chart-line text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Dashboard Analitik</h3>
                <p className="text-gray-600">Bisnis mendapatkan wawasan tentang rantai pasokan mereka dengan alat analitik dan pelaporan yang kuat.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-mobile-alt text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Ramah Seluler</h3>
                <p className="text-gray-600">Akses sistem kapan saja, di mana saja dengan antarmuka responsif yang ramah seluler.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition duration-300">
              <div className="bg-primary p-4 text-white">
                <i className="fas fa-users text-3xl"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">Jaringan Pemangku Kepentingan</h3>
                <p className="text-gray-600">Terhubung dengan bisnis bersertifikat halal lainnya melalui jaringan #TemanHalal kami.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl heading-larger font-bold text-gray-900 mb-4">Proses Penelusuran Kami</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primaryLight -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-5 gap-6">
              <div className="bg-primaryLight rounded-lg p-4 text-center relative z-10 card-hover">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  <i className="fas fa-tractor text-2xl"></i>
                </div>
                <h4 className="font-bold mb-1">Peternakan</h4>
                <p className="text-sm text-gray-600">Pembiakan & pemberian pakan halal</p>
              </div>
              
              <div className="bg-primaryLight rounded-lg p-4 text-center relative z-10 card-hover">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  <i className="fas fa-truck text-2xl"></i>
                </div>
                <h4 className="font-bold mb-1">Transportasi</h4>
                <p className="text-sm text-gray-600">Transportasi hewan yang etis</p>
              </div>
              
              <div className="bg-primaryLight rounded-lg p-4 text-center relative z-10 card-hover">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  <i className="fas fa-kaaba text-2xl"></i>
                </div>
                <h4 className="font-bold mb-1">Penyembelihan</h4>
                <p className="text-sm text-gray-600">Penyembelihan ritual oleh profesional bersertifikat</p>
              </div>
              
              <div className="bg-primaryLight rounded-lg p-4 text-center relative z-10 card-hover">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  <i className="fas fa-warehouse text-2xl"></i>
                </div>
                <h4 className="font-bold mb-1">Pemrosesan</h4>
                <p className="text-sm text-gray-600">Fasilitas bersertifikat halal</p>
              </div>
              
              <div className="bg-primaryLight rounded-lg p-4 text-center relative z-10 card-hover">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                  <i className="fas fa-shopping-bag text-2xl"></i>
                </div>
                <h4 className="font-bold mb-1">Ritel</h4>
                <p className="text-sm text-gray-600">Produk halal terverifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section (#TemanHalal) */}
      <section id="partners" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl heading-larger font-bold text-gray-900 mb-4">Jaringan #TemanHalal Kami</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg md:text-xl font-larger max-w-3xl mx-auto">
              Temui jaringan {partnersStats.total} bisnis bersertifikat halal terpercaya kami di seluruh rantai pasokan
            </p>
          </div>
          
          {/* Entity Type Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('all')}
            >
              Semua Mitra
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'farmer' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('farmer')}
            >
              Peternak
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'animal-market' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('animal-market')}
            >
              Pasar Hewan
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'slaughterhouse' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('slaughterhouse')}
            >
              Rumah Potong Hewan
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'jagal' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('jagal')}
            >
              Jagal
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'distributor' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('distributor')}
            >
              Distributor
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${activeFilter === 'horeca' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
              onClick={() => handleFilterClick('horeca')}
            >
              HoReCa
            </button>
          </div>
          
          {/* Partner Grid */}
          {partnersLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-600">Memuat mitra...</span>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 text-lg">Belum ada mitra yang terdaftar dalam kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPartners.map(partner => (
                <div key={partner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`h-32 ${partner.color === 'primary' ? 'bg-primary' : 
                  partner.color === 'yellow-500' ? 'bg-yellow-500' : 
                  partner.color === 'red-500' ? 'bg-red-500' : 
                  partner.color === 'orange-500' ? 'bg-orange-500' : 
                  partner.color === 'indigo-500' ? 'bg-indigo-500' : 
                  partner.color === 'green-500' ? 'bg-green-500' : ''} bg-opacity-10 flex items-center justify-center`}>
                  <div className={`w-20 h-20 rounded-full ${partner.color === 'primary' ? 'bg-primary' : 
                    partner.color === 'yellow-500' ? 'bg-yellow-500' : 
                    partner.color === 'red-500' ? 'bg-red-500' : 
                    partner.color === 'orange-500' ? 'bg-orange-500' : 
                    partner.color === 'indigo-500' ? 'bg-indigo-500' : 
                    partner.color === 'green-500' ? 'bg-green-500' : ''} text-white flex items-center justify-center`}>
                    <i className={`${partner.icon} text-3xl`}></i>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg">{partner.name}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {partner.type === 'farmer' && 'Peternak'}
                      {partner.type === 'animal-market' && 'Pasar Hewan'}
                      {partner.type === 'jagal' && 'Jagal'}
                      {partner.type === 'slaughterhouse' && 'Rumah Potong Hewan'}
                      {partner.type === 'distributor' && 'Distributor'}
                      {partner.type === 'horeca' && 'HoReCa'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 text-justify">{partner.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <i className="fas fa-map-marker-alt mr-1 text-primary"></i>
                    <span>{partner.location}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{partner.certification}</span>
                    <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">Sejak {partner.since}</span>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
          
          {/* View More Button */}
          <div className="text-center">
            <button className="bg-white border border-primary text-primary hover:bg-primaryLight px-6 py-2 rounded-md transition duration-300">
              Lihat Semua Mitra <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl heading-larger font-bold text-gray-900 mb-4">Apa Kata Mitra Kami</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-primaryLight rounded-xl p-6 card-hover">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                    <i className="fas fa-user text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-justify font-larger">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="signup" className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl heading-larger font-bold mb-6">Siap Memastikan Integritas Halal?</h2>
          <p className="text-xl md:text-2xl font-larger mb-8 max-w-3xl mx-auto">Bergabunglah dengan sistem penelusuran kami hari ini dan berikan pelanggan Anda transparansi lengkap tentang produk halal Anda.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300">Daftar Sekarang</Link>
            <button onClick={() => scrollToSection('contact')} className="border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-3 px-8 rounded-lg transition duration-300">Hubungi Kami</button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal 
        isVisible={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        modalRef={modalRef} 
      />

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-shield-halved text-primary text-2xl mr-2"></i>
                <span className="text-xl font-bold">Halalan Thoyyiban</span>
              </div>
              <p className="text-gray-400 mb-4 text-justify font-larger">Memastikan integritas halal dari peternakan hingga konsumen melalui penelusuran yang transparan.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-primary transition duration-300">Tentang</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-primary transition duration-300">Fitur</button></li>
                <li><button onClick={() => scrollToSection('partners')} className="text-gray-400 hover:text-primary transition duration-300">#TemanHalal</button></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-primary transition duration-300">Daftar</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-3 text-primary"></i>
                  <span>123 Jalan Halal, Jakarta, Indonesia</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt mt-1 mr-3 text-primary"></i>
                  <span>+62 21 1234 5678</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-3 text-primary"></i>
                  <span>info@halalanthoyyiban.id</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Buletin</h4>
              <p className="text-gray-400 mb-4 text-justify font-larger">Berlangganan buletin kami untuk pembaruan dan berita industri halal.</p>
              <form className="flex">
                <input type="email" placeholder="Email Anda" className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-900 w-full" />
                <button type="submit" className="bg-primary hover:bg-primaryDark px-4 py-2 rounded-r-lg transition duration-300">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Halalan Thoyyiban Traceability System. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>

      {/* CSS Styles */}
      {/* No need for inline styles as they're now in the LandingPageCSS component */}
    </div>
  );
};

export default LandingPage;
