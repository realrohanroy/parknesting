
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Home, Car, ShieldCheck, ParkingSquare } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, isLoading, error } = useUser();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="h-24 w-24 mb-2">
                      <AvatarImage 
                        src={userProfile?.avatar_url || undefined} 
                        alt={userProfile?.first_name || "User"} 
                      />
                      <AvatarFallback>
                        {userProfile?.first_name?.charAt(0) || userProfile?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">
                      {userProfile?.first_name 
                        ? `${userProfile.first_name} ${userProfile.last_name || ''}`
                        : userProfile?.email || "User"
                      }
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">
                      {userProfile?.role || "Guest"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    
                    {userProfile?.role === "host" && (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/host-profile-setup')}
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Host Settings
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/manage-parking-spaces')}
                        >
                          <ParkingSquare className="mr-2 h-4 w-4" />
                          Manage Spaces
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate('/vehicles')}
                    >
                      <Car className="mr-2 h-4 w-4" />
                      Manage Vehicles
                    </Button>
                    
                    {userProfile?.role === "admin" && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/admin')}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No recent activity to display.</p>
                </CardContent>
              </Card>
            </div>
            
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
