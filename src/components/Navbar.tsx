
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, PlusCircle } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        isScrolled 
          ? 'py-2 bg-white/80 backdrop-blur-lg shadow-sm' 
          : 'py-4 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <span className="text-2xl font-bold text-parkongo-700">
            Park<span className="text-parkongo-500">ongo</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-parkongo-600 transition-colors font-medium"
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className="text-gray-700 hover:text-parkongo-600 transition-colors font-medium"
          >
            Find Parking
          </Link>
          <div className="relative group">
            <button className="flex items-center text-gray-700 hover:text-parkongo-600 transition-colors font-medium">
              How It Works <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <div className="py-1 rounded-md bg-white">
                <Link to="/for-renters" className="block px-4 py-2 text-sm text-gray-700 hover:bg-parkongo-50">
                  For Renters
                </Link>
                <Link to="/for-hosts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-parkongo-50">
                  For Hosts
                </Link>
              </div>
            </div>
          </div>
          <Link 
            to="/about" 
            className="text-gray-700 hover:text-parkongo-600 transition-colors font-medium"
          >
            About
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="outline"
            leftIcon={<PlusCircle className="h-4 w-4" />}
            href="/for-hosts"
            className="border-parkongo-200 text-parkongo-700 hover:bg-parkongo-50"
          >
            List Your Space
          </Button>
          <Button variant="ghost" href="/auth?type=signin">
            Sign In
          </Button>
          <Button 
            variant="default"
            customStyle="primary" 
            href="/auth?type=signup"
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-white z-40 flex flex-col pt-20 pb-6 px-4 md:hidden transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col space-y-6 mt-6">
          <Link 
            to="/" 
            className="text-xl font-medium text-gray-700" 
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className="text-xl font-medium text-gray-700" 
            onClick={closeMenu}
          >
            Find Parking
          </Link>
          <div className="space-y-3">
            <p className="text-xl font-medium text-gray-700">How It Works</p>
            <Link 
              to="/for-renters" 
              className="block pl-4 text-lg text-gray-600" 
              onClick={closeMenu}
            >
              For Renters
            </Link>
            <Link 
              to="/for-hosts" 
              className="block pl-4 text-lg text-gray-600" 
              onClick={closeMenu}
            >
              For Hosts
            </Link>
          </div>
          <Link 
            to="/about" 
            className="text-xl font-medium text-gray-700" 
            onClick={closeMenu}
          >
            About
          </Link>
          <Link 
            to="/for-hosts" 
            className="text-xl font-medium text-parkongo-600 flex items-center gap-2" 
            onClick={closeMenu}
          >
            <PlusCircle className="h-5 w-5" />
            List Your Space
          </Link>
        </nav>
        <div className="mt-auto space-y-4">
          <Button 
            variant="outline" 
            fullWidth 
            href="/auth?type=signin"
            onClick={closeMenu}
          >
            Sign In
          </Button>
          <Button 
            variant="default"
            customStyle="primary"
            fullWidth 
            href="/auth?type=signup"
            onClick={closeMenu}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
