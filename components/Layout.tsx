import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { Menu, X, Cross, User as UserIcon, LogOut, Phone, Siren, Award, Facebook, Twitter, Linkedin, LayoutDashboard, Globe } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => 
    location.pathname === path 
      ? 'text-teal-700 font-bold' 
      : 'text-slate-600 hover:text-teal-600';

  const closeMenu = () => setIsMenuOpen(false);

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor-dashboard';
    return '/patient-dashboard';
  };

  const dashboardPath = getDashboardLink();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-stone-50">
      
      {/* Floating Action Buttons */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 pointer-events-none">
        <a href="tel:10666" className="bg-teal-700 text-white p-3 rounded-l-xl shadow-lg hover:bg-teal-800 transition-all group relative flex items-center justify-end w-12 hover:w-48 overflow-hidden pointer-events-auto">
            <span className="absolute right-14 opacity-0 group-hover:opacity-100 whitespace-nowrap font-medium transition-opacity">Hotline: 10666</span>
            <Phone className="w-6 h-6 shrink-0" />
        </a>
        <a href="tel:999" className="bg-red-600 text-white p-3 rounded-l-xl shadow-lg hover:bg-red-700 transition-all group relative flex items-center justify-end w-12 hover:w-48 overflow-hidden pointer-events-auto">
            <span className="absolute right-14 opacity-0 group-hover:opacity-100 whitespace-nowrap font-medium transition-opacity">Emergency: 999</span>
            <Siren className="w-6 h-6 shrink-0" />
        </a>
        <div className="bg-yellow-500 text-white p-3 rounded-l-xl shadow-lg flex items-center justify-center w-12 cursor-default pointer-events-auto">
            <Award className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                    <Cross className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none font-serif">AD Hospital</span>
                  <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase font-sans">Excellence in Care</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link to="/" className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isActive('/')}`}>Home</Link>
              <Link to="/doctors" className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isActive('/doctors')}`}>Doctors</Link>
              <Link to="/appointments" className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isActive('/appointments')}`}>Appointments</Link>
              
              {dashboardPath && (
                <Link to={dashboardPath} className={`text-sm font-semibold uppercase tracking-wide transition-colors flex items-center gap-1 ${isActive(dashboardPath)}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Link>
              )}
              
              <div className="flex items-center pl-6 border-l border-slate-200 ml-4 gap-4">
                <button className="flex items-center gap-1 text-slate-500 hover:text-teal-600 font-bold text-xs uppercase tracking-wide">
                    <Globe className="w-4 h-4" /> EN
                </button>

                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                          <span className="leading-none">{user.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{user.role}</span>
                      </div>
                    </span>
                    <button
                      onClick={() => { logout(); closeMenu(); }}
                      className="text-sm text-slate-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full z-50 shadow-xl">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link to="/" onClick={closeMenu} className="block px-3 py-3 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">Home</Link>
              <Link to="/doctors" onClick={closeMenu} className="block px-3 py-3 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">Doctors</Link>
              <Link to="/appointments" onClick={closeMenu} className="block px-3 py-3 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">Appointments</Link>
              
              {dashboardPath && (
                <Link to={dashboardPath} onClick={closeMenu} className="block px-3 py-3 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">Dashboard</Link>
              )}
              
              {user ? (
                <div className="border-t border-slate-100 mt-2 pt-2">
                    <div className="px-3 py-2 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                            <UserIcon className="w-4 h-4" />
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900">{user.name}</span>
                            <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                         </div>
                    </div>
                    <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="w-full text-left block px-3 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                    >
                    Logout
                    </button>
                </div>
              ) : (
                <Link to="/login" onClick={closeMenu} className="block px-3 py-3 text-base font-semibold text-teal-600 hover:bg-teal-50 rounded-lg">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-teal-600 p-1.5 rounded text-white">
                  <Cross className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-white font-serif">AD Hospital</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-sans">
                Committed to providing world-class healthcare with a personal touch. Accredited by JCI for excellence in quality and safety.
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all group">
                  <Facebook className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 transition-all group">
                  <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-700 transition-all group">
                  <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-sans">Quick Links</h3>
              <ul className="space-y-2 text-sm font-sans">
                <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Find a Doctor</Link></li>
                <li><Link to="/appointments" className="hover:text-teal-400 transition-colors">Book Appointment</Link></li>
                <li><Link to="/#news" className="hover:text-teal-400 transition-colors">News & Updates</Link></li>
                <li><a href="tel:999" className="hover:text-teal-400 transition-colors">Emergency Info</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-sans">Departments</h3>
              <ul className="space-y-2 text-sm font-sans">
                <li><Link to="/doctors?specialty=Cardiology" className="hover:text-teal-400 transition-colors">Cardiology</Link></li>
                <li><Link to="/doctors?specialty=Neurology" className="hover:text-teal-400 transition-colors">Neurology</Link></li>
                <li><Link to="/doctors?specialty=Orthopedics" className="hover:text-teal-400 transition-colors">Orthopedics</Link></li>
                <li><Link to="/doctors?specialty=Pediatrics" className="hover:text-teal-400 transition-colors">Pediatrics</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-sans">Contact</h3>
              <ul className="space-y-3 text-sm text-slate-400 font-sans">
                <li className="flex gap-3 items-start">
                  <span className="text-white font-medium">Addr:</span>
                  123 Hospital Ave, Gulshan, Dhaka 1212
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-medium">Email:</span>
                  info@adhospital.com
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-medium">Hotline:</span>
                  10666
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
            <p>© {new Date().getFullYear()} AD Hospital. All rights reserved.</p>
            <p>Developed with <span className="text-red-500">♥</span> for Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;