import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from './Button';
import CategoriesDrawer from './CategoriesDrawer';
import { fetchCategories } from '../api/productsApi';
import {
  MapPinIcon,
  BellIcon,
  ShoppingCartIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local UI state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentCategory = useMemo(() => searchParams.get('category') || 'all', [searchParams]);

  useEffect(() => {
    // Load categories for the category bar
    const load = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(['all', ...cats]);
      } catch (e) {
        setCategories(['all']);
      }
    };
    load();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search && search.trim()) params.q = search.trim();
    if (currentCategory && currentCategory !== 'all') params.category = currentCategory;
    setSearchParams(params);
    navigate({ pathname: '/', search: `?${new URLSearchParams(params).toString()}` });
  };

  const goToCategory = (cat) => {
    const params = {};
    if (search && search.trim()) params.q = search.trim();
    if (cat && cat !== 'all') params.category = cat;
    setSearchParams(params);
    navigate({ pathname: '/', search: `?${new URLSearchParams(params).toString()}` });
    setIsDrawerOpen(false); // Close drawer when navigating
  };

  const handleAllCategoriesClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Left: Logo + Location */}
          <div className="flex items-center gap-4 min-w-[200px]">
            <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">
              E-Shop
            </Link>
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-primary-300">
              <MapPinIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">400003</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              <span className="ml-1 hidden lg:inline text-gray-500">Mumbai</span>
            </button>
          </div>

          {/* Middle: Delivery info (on md+) */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-primary-500 inline-block"></span>
            <span>
              Earliest <span className="text-primary-600 font-medium">Home Delivery</span> available
            </span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-4xl w-full">
            <div className="flex">
              <div className="flex items-center gap-2 flex-1 border border-gray-300 rounded-l-lg px-3 focus-within:ring-2 focus-within:ring-primary-500">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for products"
                  className="w-full py-2 outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-r-lg font-medium">
                SEARCH
              </button>
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-[120px] sm:min-w-[180px] justify-end">
            {/* Desktop Auth Links */}
            {isAuthenticated ? (
              // Authenticated user actions
              <>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-700">Welcome, {user?.name || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary-700 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
                <button className="hidden sm:inline-flex p-2 rounded-full hover:bg-gray-100 md:hidden">
                  <BellIcon className="w-6 h-6 text-primary-600" />
                </button>
              </>
            ) : (
              // Unauthenticated user actions
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/register" className="text-gray-700 hover:text-primary-700 text-sm font-medium">
                    <span>Register</span>
                  </Link>
                  <Link to="/login" className="text-gray-700 hover:text-primary-700 text-sm font-medium">
                    <span>Login</span>
                  </Link>
                </div>
                <button className="hidden sm:inline-flex p-2 rounded-full hover:bg-gray-100 md:hidden">
                  <BellIcon className="w-6 h-6 text-primary-600" />
                </button>
              </>
            )}

            {/* Mobile User Menu */}
            <div className="relative user-menu-container md:hidden">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="User menu"
              >
                <UserIcon className="w-6 h-6 text-primary-600" />
              </button>

              {/* Mobile User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-w-[calc(100vw-2rem)]">
                  {isAuthenticated ? (
                    // Authenticated mobile menu
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">Welcome back!</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    // Unauthenticated mobile menu
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative inline-flex p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-12 overflow-x-auto">
            <button
              className="inline-flex items-center gap-2 text-gray-800 hover:text-primary-700 font-medium whitespace-nowrap"
              onClick={handleAllCategoriesClick}
            >
              <Bars3Icon className="w-5 h-5" />
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => goToCategory(cat)}
                className={`text-sm whitespace-nowrap pb-0.5 border-b-2 transition-colors ${
                  (currentCategory === cat) || (currentCategory === 'all' && cat === 'all')
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-700 hover:text-primary-700'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Drawer */}
      <CategoriesDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </header>
  );
};

export default Header;
