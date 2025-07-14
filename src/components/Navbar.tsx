import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import * as React from "react";
import { FaChartLine, FaBell, FaUserCircle } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import { logout } from "../Redux/Slices/LoginSlices";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.login.user);

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(user ? [{ path: '/employee-dashboard', label: 'Tasks' }] : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="relative flex items-center justify-between h-20 px-4 lg:px-8 border-b border-gray-100">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <FaChartLine className="text-2xl bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent" />
          <span className="text-xl font-bold bg-gradient-to-r from-green to-purple-600 bg-clip-text text-transparent">
            StaffMonitor
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === path
                  ? 'bg-gradient-to-r from-green to-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gradient-to-r from-white/100 to-purple-600/10 hover:text-green'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Notification and User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r from-green/100 to-purple-600 transition-all duration-300 hover:text-white">
                <FaUserCircle className="h-6 w-6 text-gray-600 hover:text-white" />
                <span className="text-sm text-gray-600 hover:text-white">{user.username}</span>
              </button>
              <button
                className="bg-green text-white hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r from-green/100 to-purple-600 transition-all duration-300"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden bg-green text-white lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r from-green/100 to-purple-600 transition-all duration-300"
            >
              Login
            </Link>
          )}

          <button
            className="lg:hidden p-2 hover:bg-gradient-to-r from-green/100 to-purple-600 rounded-lg transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <RxHamburgerMenu className="h-6 w-6 text-gray-600 hover:text-green" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search tasks, employees..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green"
            />
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === path
                    ? 'bg-gradient-to-r from-green/100 to-purple-600/100 text-green'
                    : 'text-gray-600 hover:bg-gradient-to-r from-green/100 to-purple/100 hover:text-green'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <button
                type="button"
                className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-600 hover:bg-gradient-to-r from-green/100 to-purple-500 hover:text-green"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-600 hover:bg-gradient-to-r from-green/100 to-purple-500 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;