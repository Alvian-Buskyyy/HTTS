import React from "react";
import { Link, useNavigate } from "react-router-dom";

const PasarHewanSidebar = ({ activeSection, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    // Clear session/local storage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    // Redirect to login page
    navigate("/");
  };

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-tachometer-alt", link: "/pasarhewan/dashboard" },
    { id: "ternak", label: "Data Sapi", icon: "fa-cow", link: "/pasarhewan/ternak" },
    { id: "transaction", label: "Transaksi Penjualan", icon: "fa-handshake", link: "/pasarhewan/transaksi" },
    { id: "transfer", label: "Transfer Sapi", icon: "fa-exchange-alt", link: "/pasarhewan/transfer" },
    { id: "health", label: "Cek Kesehatan", icon: "fa-stethoscope", link: "/pasarhewan/health" },
  ];

  return (
    <div className={`bg-white shadow-sm fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center py-6 border-b">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <i className="fas fa-leaf"></i>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-semibold text-gray-800">HATS</h1>
            <p className="text-xs text-gray-500">Halal Traceability System</p>
          </div>
        </div>

        {/* User Info - Mobile Only */}
        <div className="lg:hidden flex items-center p-4 border-b">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            <i className="fas fa-user"></i>
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-gray-800">Pasar Hewan Al-Falah</h2>
            <p className="text-xs text-gray-500">Pasar Hewan</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-500 lg:hidden focus:outline-none">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition border-r-4 ${
                    activeSection === item.id ? "text-primary bg-primary/10 font-medium border-primary" : "border-transparent"
                  }`}
                >
                  <i className={`fas ${item.icon} w-5`}></i>
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: Profile, Settings, Logout */}
        <div className="p-4 border-t space-y-1">
          <Link to="/pasarhewan/profile" className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === "profile" ? "text-primary bg-primaryLight font-medium" : ""}`}>
            <i className="fas fa-user-circle w-5"></i>
            <span className="ml-2">Profil</span>
          </Link>
          <Link to="/pasarhewan/settings" className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary transition rounded-md ${activeSection === "settings" ? "text-primary bg-primaryLight font-medium" : ""}`}>
            <i className="fas fa-cog w-5"></i>
            <span className="ml-2">Pengaturan</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition">
            <i className="fas fa-sign-out-alt mr-3"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasarHewanSidebar;
