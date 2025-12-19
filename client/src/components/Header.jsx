import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSearch, FaUser, FaSignOutAlt, FaHome, FaInfoCircle, FaBuilding, FaLeaf, FaHeart, FaMountain, FaCogs, FaUsers } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signOutUserStart,
  deleteUserFailure,
  deleteUserSuccess
} from '../redux/user/userSlice';
import logo from '../assets/img/logo.png';

export default function Header() {
  const { currentUser } = useSelector(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    const params = new URLSearchParams();
    params.set('searchTerm', searchTerm);
    navigate(`/search?${params}`);
    setNavOpen(false);
    setSearchTerm('');
  };

  const handleSignout = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY_ONRENDER}/api/auth/signout`
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      localStorage.removeItem('token');
      navigate('/sign-in');
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userOpen && !e.target.closest('.user-dropdown-trigger')) {
        setUserOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userOpen]);

  const menuItems = [
    { route: '/', label: 'Home', icon: <FaHome className="mr-2" /> },
    { route: '/about', label: 'Sobre', icon: <FaInfoCircle className="mr-2" /> },
    { route: '/imo-home', label: 'Imobiliária', icon: <FaBuilding className="mr-2" /> },
    { route: '/agri', label: 'Agricultura', icon: <FaLeaf className="mr-2" /> },
    { route: '/saude', label: 'Saúde', icon: <FaHeart className="mr-2" /> },
    { route: '/minin', label: 'Mineração', icon: <FaMountain className="mr-2" /> },
    { route: '/diver', label: 'Serviços', icon: <FaCogs className="mr-2" /> },
    { route: '/team', label: 'Equipe', icon: <FaUsers className="mr-2" /> },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#CEE9EF] shadow-lg backdrop-blur-sm bg-opacity-95' 
        : 'bg-[#CEE9EF]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logo} 
                alt="Bule Global Solution Logo" 
                className="h-14 w-auto transition-transform group-hover:scale-105" 
              />
              <div className="hidden md:flex flex-col">
                <span className="text-xl font-bold text-gray-900 leading-tight">
                  Bule Global
                </span>
                <span className="text-sm text-gray-700 font-medium">
                  Solution
                </span>
              </div>
            </Link>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.slice(1).map((item, idx) => (
              <Link
                key={idx}
                to={item.route}
                className="flex items-center px-4 py-2 rounded-lg text-gray-800 hover:bg-white hover:bg-opacity-50 hover:text-gray-900 transition-all duration-200 font-medium text-sm"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Área direita - Search e User */}
          <div className="flex items-center gap-4">
            {/* Campo de busca Desktop */}
            <form 
              onSubmit={handleSearch} 
              className="hidden md:flex items-center relative"
            >
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 py-2 rounded-full bg-white bg-opacity-80 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-900 placeholder-gray-500 w-48 lg:w-56 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!searchTerm.trim()}
                className="absolute right-3 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaSearch />
              </button>
            </form>

            {/* Ícone do usuário */}
            <div className="relative user-dropdown-trigger">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-80 border-2 border-blue-500 hover:border-blue-600 hover:bg-white transition-all duration-200 shadow-sm"
                aria-label="Menu do usuário"
              >
                {currentUser ? (
                  <img
                    src={currentUser.avatar}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="text-gray-700" />
                )}
              </button>

              {/* Dropdown do usuário */}
              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-30 animate-fadeIn">
                  {currentUser ? (
                    <>
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-[#CEE9EF]">
                        <p className="font-semibold text-gray-900">{currentUser.name || currentUser.username}</p>
                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-800 transition-colors"
                      >
                        <FaUser className="mr-3 text-blue-500" />
                        <span>Meu Perfil</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserOpen(false);
                          handleSignout();
                        }}
                        className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3" />
                        <span>Sair</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/sign-in"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-800 transition-colors"
                    >
                      <FaUser className="mr-3 text-blue-500" />
                      <span>Entrar na Conta</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Botão menu mobile */}
            <button
              onClick={() => setNavOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white bg-opacity-80 hover:bg-white text-gray-800 hover:text-blue-600 transition-all duration-200"
              aria-label="Abrir menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {navOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          
          {/* Menu lateral */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 animate-slideIn">
            <div className="flex flex-col h-full">
              {/* Cabeçalho do menu mobile */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#CEE9EF] to-white">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Logo" className="h-10 w-auto" />
                  <div>
                    <p className="font-bold text-gray-900">Bule Global</p>
                    <p className="text-sm text-gray-700">Solution</p>
                  </div>
                </div>
                <button
                  onClick={() => setNavOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Fechar menu"
                >
                  <FaTimes size={20} className="text-gray-700" />
                </button>
              </div>

              {/* Campo de busca mobile */}
              <form 
                onSubmit={handleSearch}
                className="p-4 border-b border-gray-100"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="O que você procura?"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={!searchTerm.trim()}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
                  >
                    <FaSearch size={18} />
                  </button>
                </div>
              </form>

              {/* Navegação mobile */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {menuItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.route}
                      onClick={() => setNavOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg hover:bg-[#CEE9EF] hover:bg-opacity-50 text-gray-800 hover:text-gray-900 transition-colors group"
                    >
                      <span className="text-blue-500 group-hover:text-blue-600 transition-colors">
                        {item.icon}
                      </span>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rodapé do menu mobile */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <img
                        src={currentUser.avatar}
                        alt="Perfil"
                        className="w-10 h-10 rounded-full border-2 border-blue-500"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{currentUser.name || currentUser.username}</p>
                        <p className="text-sm text-gray-600">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/profile"
                        onClick={() => setNavOpen(false)}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center font-medium transition-colors"
                      >
                        Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setNavOpen(false);
                          handleSignout();
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/sign-in"
                    onClick={() => setNavOpen(false)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-center transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Entrar na Conta
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animações */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}