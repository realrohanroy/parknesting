
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Warehouse, CheckCircle, DollarSign, Calendar, Shield } from 'lucide-react';

const ForHosts: React.FC = () => {
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
                  >
                    List Your Space Now
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
