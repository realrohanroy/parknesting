import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Menu, Search, X, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { NotificationsPanel } from './NotificationsPanel';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close nav when route changes
  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="container mx-auto px-4 md:px-6 py-2">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 text-parkongo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ParkEasy</span>
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-parkongo-600 transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-gray-700 hover:text-parkongo-600 transition-colors">
                Find Parking
              </Link>
              <Link to="/for-hosts" className="text-gray-700 hover:text-parkongo-600 transition-colors">
                Host Parking
              </Link>
              {user && (
                <Link to="/dashboard" className="text-gray-700 hover:text-parkongo-600 transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          )}

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <Button variant="outline" size="icon" onClick={() => navigate('/search')}>
                <Search className="h-4 w-4" />
              </Button>
            )}

            {user ? (
              <>
                {/* Notifications Panel */}
                <NotificationsPanel />
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=bookings')}>
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard?tab=profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="default" 
                onClick={() => navigate('/auth')}
                className="bg-parkongo-600 hover:bg-parkongo-700"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleNav}>
                {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isNavOpen && (
          <div className="md:hidden mt-2 py-4 bg-white border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Home
              </Link>
              <Link to="/search" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Find Parking
              </Link>
              <Link to="/for-hosts" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Host Parking
              </Link>
              {user && (
                <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Dashboard
                </Link>
              )}
              {user ? (
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" className="px-3 py-2 text-parkongo-600 hover:bg-gray-100 rounded-md font-medium">
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
