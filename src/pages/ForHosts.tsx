
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Warehouse, CheckCircle, DollarSign, Calendar, Shield, Upload, CameraIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ForHosts: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    spaceType: '',
    size: '',
    price: '',
    description: '',
    availableAllDay: true,
    securityCamera: false,
    coverImage: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, coverImage: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Space Listed Successfully!",
        description: "Your parking space has been listed on Parkongo. You'll be notified when someone books it.",
      });
      setShowForm(false);
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        spaceType: '',
        size: '',
        price: '',
        description: '',
        availableAllDay: true,
        securityCamera: false,
        coverImage: null,
      });
    }, 1500);
  };
  
  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6 text-parkongo-600" />,
      title: "Earn Extra Income",
      description: "Turn your unused parking space into a source of passive income. Set your own rates and availability."
    },
    {
      icon: <Calendar className="h-6 w-6 text-parkongo-600" />,
      title: "Flexible Scheduling",
      description: "Choose when your space is available - rent it out full-time or only during specific hours."
    },
    {
      icon: <Shield className="h-6 w-6 text-parkongo-600" />,
      title: "Protected & Secure",
      description: "Our platform includes insurance protection and secure payment processing for peace of mind."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-parkongo-50 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 animate-fade-in-up">
                  Turn Your Parking Space Into Profit
                </h1>
                <p className="text-xl text-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Join thousands of hosts who are earning passive income by renting out their unused parking spaces on Parkongo.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <Button
                    variant="default"
                    size="lg"
                    customStyle="primary"
                    leftIcon={<Warehouse className="h-5 w-5" />}
                    onClick={() => setShowForm(!showForm)}
                  >
                    {showForm ? "Hide Form" : "List Your Space Now"}
                  </Button>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white p-6 animate-float">
                <div className="bg-parkongo-50 p-4 rounded-xl mb-6">
                  <h3 className="text-xl font-semibold text-parkongo-700 mb-2">Potential Monthly Earnings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-parkongo-100">
                      <span className="text-gray-700">Urban Center</span>
                      <span className="font-semibold">₹5,000 - ₹8,000</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-parkongo-100">
                      <span className="text-gray-700">Residential Area</span>
                      <span className="font-semibold">₹3,000 - ₹5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Business District</span>
                      <span className="font-semibold">₹6,000 - ₹12,000</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Actual earnings may vary based on location, availability, and demand
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Listing Form Section - Only shown when showForm is true */}
        {showForm && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-center">List Your Parking Space</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="John Doe" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            placeholder="john@example.com" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            placeholder="+91 9876543210" 
                            required 
                          />
                        </div>
                      </div>
                      
                      {/* Space Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Space Information</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            placeholder="123 Main St" 
                            required 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input 
                              id="city" 
                              name="city" 
                              value={formData.city} 
                              onChange={handleInputChange} 
                              placeholder="Mumbai" 
                              required 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input 
                              id="zipCode" 
                              name="zipCode" 
                              value={formData.zipCode} 
                              onChange={handleInputChange} 
                              placeholder="400001" 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="spaceType">Space Type</Label>
                          <Select 
                            value={formData.spaceType} 
                            onValueChange={(value) => handleSelectChange('spaceType', value)}
                          >
                            <SelectTrigger id="spaceType">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="garage">Garage</SelectItem>
                              <SelectItem value="driveway">Driveway</SelectItem>
                              <SelectItem value="carport">Carport</SelectItem>
                              <SelectItem value="outdoor">Outdoor Space</SelectItem>
                              <SelectItem value="underground">Underground</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Space Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="size">Size</Label>
                          <Select 
                            value={formData.size} 
                            onValueChange={(value) => handleSelectChange('size', value)}
                          >
                            <SelectTrigger id="size">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compact">Compact Car</SelectItem>
                              <SelectItem value="standard">Standard Car</SelectItem>
                              <SelectItem value="large">Large Car/SUV</SelectItem>
                              <SelectItem value="oversized">Oversized/Van</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="price">Monthly Price (₹)</Label>
                          <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            value={formData.price} 
                            onChange={handleInputChange} 
                            placeholder="3000" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="availableAllDay">Available 24/7</Label>
                            <Switch 
                              id="availableAllDay" 
                              checked={formData.availableAllDay}
                              onCheckedChange={(checked) => handleSwitchChange('availableAllDay', checked)}
                            />
                          </div>
                          <p className="text-sm text-gray-500">Toggle off if your space has limited hours</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="securityCamera">Security Camera</Label>
                            <Switch 
                              id="securityCamera" 
                              checked={formData.securityCamera}
                              onCheckedChange={(checked) => handleSwitchChange('securityCamera', checked)}
                            />
                          </div>
                          <p className="text-sm text-gray-500">Does your space have security cameras?</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={formData.description} 
                          onChange={handleInputChange} 
                          placeholder="Describe your parking space, access instructions, and any special features." 
                          rows={4} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coverImage">Upload Photos</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition">
                          <input
                            id="coverImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <label htmlFor="coverImage" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <CameraIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">
                              {formData.coverImage ? formData.coverImage.name : "Click to upload photos of your space"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Clear photos increase booking chances by 80%
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        variant="default"
                        customStyle="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        type="submit"
                        fullWidth
                      >
                        Submit Listing
                      </Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        By submitting, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Why Host on Parkongo?</h2>
              <p className="text-xl text-gray-600">
                Join our community of hosts and start earning from your unused parking space
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="h-12 w-12 bg-parkongo-100 rounded-full flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">How Hosting Works</h2>
              <p className="text-xl text-gray-600">
                Three simple steps to start earning from your parking space
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    title: "List Your Space",
                    description: "Add details, photos, and set your price and availability."
                  },
                  {
                    step: "2",
                    title: "Get Bookings",
                    description: "Drivers book your space through our platform."
                  },
                  {
                    step: "3",
                    title: "Earn Money",
                    description: "Get paid securely for each booking."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-parkongo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-parkongo-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Earning?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of hosts who are already earning passive income with their parking spaces.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-white text-parkongo-600 hover:bg-gray-100"
                  onClick={() => setShowForm(true)}
                >
                  List Your Space Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForHosts;
