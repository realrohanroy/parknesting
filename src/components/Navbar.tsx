
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Menu, Search, X, User, LogOut, ShieldCheck } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      }
    };
    
    checkAdminStatus();
  }, [user]);

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
          {/* Logo - Matched with footer style */}
          <Link to="/" className="flex items-center">
            <Car className="h-8 w-8 text-parkongo-600" />
            <span className="ml-2 text-2xl font-bold">
              <span className="text-parkongo-700">Park</span>
              <span className="text-parkongo-500">ongo</span>
            </span>
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
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-red-600 hover:text-red-700 transition-colors flex items-center"
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Admin
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
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="text-red-600">
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth?type=signup')}
                  className="bg-white hover:bg-gray-50"
                >
                  Sign Up
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => navigate('/auth?type=signin')}
                  className="bg-parkongo-600 hover:bg-parkongo-700"
                >
                  Sign In
                </Button>
              </>
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
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Admin Dashboard
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
                <>
                  <Link to="/auth?type=signin" className="px-3 py-2 text-parkongo-600 hover:bg-gray-100 rounded-md font-medium">
                    Sign In
                  </Link>
                  <Link to="/auth?type=signup" className="px-3 py-2 text-parkongo-600 hover:bg-gray-100 rounded-md font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
