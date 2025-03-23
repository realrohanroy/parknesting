
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { User, Car, Calendar, CreditCard, Clock, ParkingCircle, Settings, Bell, LogOut } from 'lucide-react';

// Mocked user data - in a real app, this would come from an API or auth provider
const userData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: '/placeholder.svg',
  phone: '+1 (555) 123-4567',
  joinDate: 'March 2023',
  favoriteSpaces: [
    { id: 1, name: 'Downtown Parking Lot', address: '123 Main St, Downtown', lastUsed: '2 days ago' },
    { id: 2, name: 'City Center Garage', address: '456 Urban Ave, City Center', lastUsed: '1 week ago' },
  ],
  recentBookings: [
    { id: 'BK-1001', space: 'Downtown Parking Lot', date: 'Mar 21, 2023', time: '9:00 AM - 5:00 PM', status: 'Completed', amount: '$15.00' },
    { id: 'BK-1002', space: 'City Center Garage', date: 'Mar 15, 2023', time: '10:00 AM - 2:00 PM', status: 'Completed', amount: '$8.00' },
    { id: 'BK-1003', space: 'Riverside Parking', date: 'Mar 28, 2023', time: '8:00 AM - 6:00 PM', status: 'Upcoming', amount: '$20.00' },
  ],
  vehicles: [
    { id: 1, name: 'Honda Civic', plate: 'ABC-1234', color: 'Blue' },
    { id: 2, name: 'Toyota Camry', plate: 'XYZ-5678', color: 'Silver' },
  ]
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  });
  
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plate: '',
    color: '',
  });
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an API request to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an API request to add a new vehicle
    toast({
      title: "Vehicle Added",
      description: `Your vehicle ${newVehicle.name} has been added successfully.`,
    });
    setNewVehicle({ name: '', plate: '', color: '' });
  };
  
  const handleLogout = () => {
    // In a real app, this would handle logout logic
    navigate('/');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback>{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{userData.email}</p>
                  <p className="text-gray-400 text-xs mt-1">Member since {userData.joinDate}</p>
                </div>
                
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center gap-3 p-2.5 rounded-lg bg-parkongo-50 text-parkongo-700 font-medium">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                  <a href="#bookings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Calendar className="h-5 w-5" />
                    <span>Bookings</span>
                  </a>
                  <a href="#vehicles" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Car className="h-5 w-5" />
                    <span>Vehicles</span>
                  </a>
                  <a href="#favorites" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <ParkingCircle className="h-5 w-5" />
                    <span>Favorite Spaces</span>
                  </a>
                  <a href="#payments" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Methods</span>
                  </a>
                  <a href="#notifications" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </a>
                  <a href="#settings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50 text-red-600 font-medium w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Welcome Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Welcome back, {userData.name.split(' ')[0]}!</CardTitle>
                      <CardDescription>
                        Here's a summary of your recent activity and upcoming bookings.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  {/* Recent Bookings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Space</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userData.recentBookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.id}</TableCell>
                                <TableCell>{booking.space}</TableCell>
                                <TableCell>{booking.date}</TableCell>
                                <TableCell>{booking.time}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    booking.status === 'Completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </TableCell>
                                <TableCell>{booking.amount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Button variant="outline" className="w-full">View All Bookings</Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">24</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Favorite Spaces</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{userData.favoriteSpaces.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Registered Vehicles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{userData.vehicles.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profileData.name} 
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email} 
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={profileData.phone} 
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">About Me</Label>
                          <Textarea 
                            id="bio" 
                            placeholder="Tell us a little about yourself..."
                            className="min-h-24"
                          />
                        </div>
                        <Button type="submit" customStyle="primary">Save Changes</Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                      <CardDescription>
                        Manage your password and security settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Vehicles Tab */}
                <TabsContent value="vehicles" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Vehicles</CardTitle>
                      <CardDescription>
                        Manage your registered vehicles for easy booking.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userData.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Car className="h-10 w-10 text-gray-400" />
                              <div>
                                <h4 className="font-medium">{vehicle.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {vehicle.plate} • {vehicle.color}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Vehicle</CardTitle>
                      <CardDescription>
                        Register a new vehicle to use with Parkongo.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddVehicle} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-name">Vehicle Make & Model</Label>
                          <Input 
                            id="vehicle-name" 
                            placeholder="e.g. Honda Civic" 
                            value={newVehicle.name}
                            onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-plate">License Plate</Label>
                          <Input 
                            id="vehicle-plate" 
                            placeholder="e.g. ABC-1234" 
                            value={newVehicle.plate}
                            onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vehicle-color">Vehicle Color</Label>
                          <Input 
                            id="vehicle-color" 
                            placeholder="e.g. Blue" 
                            value={newVehicle.color}
                            onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" customStyle="primary">Add Vehicle</Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
