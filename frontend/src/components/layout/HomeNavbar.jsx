import { Link } from 'react-router-dom';

const HomeNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-black shadow-lg">
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

        {/* Login & Sign Up Button Section */}
        {/* Added space-x-4 to create space between the buttons */}
        <div className="flex items-center space-x-4">
          {/* Existing Login Button */}
          <Link
            to="/login"
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Login
          </Link>

          {/* New Sign Up Button */}
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;