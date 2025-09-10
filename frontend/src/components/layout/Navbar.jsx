import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('/bizzy.jpg');

  const avatarOptions = [
    '/bizzy.jpg',
    '/icon2.png',
    '/icon3.png',
    '/icon4.png',
    '/icon5.png',
    '/icon6.png',
    '/icon7.png',
    '/icon8.png',

  ];

  useEffect(() => {
    const savedAvatar = localStorage.getItem('selectedAvatar');
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

  const handleAvatarChange = (avatar) => {
    setSelectedAvatar(avatar);
    localStorage.setItem('selectedAvatar', avatar);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkClass =
    'flex items-center px-4 py-2 text-white transition-all duration-300 border-0 border-white rounded-[2.4rem]';
  const navLinkHoverClass = 'hover:bg-[#16A34A]';
  const activeLinkClass = 'bg-[#16A34A]';

  return (
    <nav className="bg-black shadow-lg">
      <div className="flex justify-between items-center h-16 max-w-full px-4">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text text-xl font-bold">
              VAN NETRA
            </span>
            <span className="ml-2 text-green-300 text-sm bg-green-800 rounded-full px-2 py-0.5">
              WebGIS
            </span>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center justify-center flex-grow space-x-8">
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`${navLinkClass} ${
                  window.location.pathname === '/dashboard'
                    ? activeLinkClass
                    : navLinkHoverClass
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/map"
                className={`${navLinkClass} ${
                  window.location.pathname === '/map'
                    ? activeLinkClass
                    : navLinkHoverClass
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Map
              </Link>
              <Link
                to="/dss"
                className={`${navLinkClass} ${
                  window.location.pathname === '/dss'
                    ? activeLinkClass
                    : navLinkHoverClass
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                DSS
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/ocr"
                  className={`${navLinkClass} ${
                    window.location.pathname === '/ocr'
                      ? activeLinkClass
                      : navLinkHoverClass
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  AI Tools
                </Link>
              )}
            </>
          )}
        </div>

        {/* Avatar + Dropdown */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <div className="relative group">
              <div className="flex items-center cursor-pointer">
                <img
                  src={selectedAvatar}
                  alt="User Avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="ml-2 text-sm text-gray-300 font-bold">
                  {user.name}
                </span>
              </div>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <ul className="py-2 text-sm text-gray-700">
                  <li className="px-4 py-2">
                    <p className="text-xs text-gray-400 mb-1">Choose Avatar</p>
                    <div className="grid grid-cols-4 gap-2">
                      {avatarOptions.map((avatar, idx) => (
                        <img
                          key={idx}
                          src={avatar}
                          alt={`Avatar ${idx + 1}`}
                          className={`h-10 w-10 rounded-full object-cover cursor-pointer border-2 transition 
                            ${
                              selectedAvatar === avatar
                                ? 'border-blue-500'
                                : 'border-transparent hover:border-gray-300'
                            }`}
                          onClick={() => handleAvatarChange(avatar)}
                        />
                      ))}
                    </div>
                  </li>
                  <hr className="my-2" />
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Settings
                  </li>
                </ul>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors rounded-[2.4rem]"
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-green-700 focus:outline-none"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu (unchanged) */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:hidden bg-green-800`}
      >
        {/* your mobile menu code stays the same */}
      </div>
    </nav>
  );
};

export default Navbar;
