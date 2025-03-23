
import React from 'react';
import { MapPin, Calendar, CreditCard, Shield, CarFront, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  return (
    <div 
      className={cn(
        "group p-6 rounded-xl hover-lift glass-card",
        "flex flex-col items-center text-center",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
    >
      <div className="mb-5 relative">
        <div className="h-16 w-16 rounded-full bg-parkongo-100 flex items-center justify-center group-hover:bg-parkongo-200 transition-colors duration-300">
          <div className="text-parkongo-600 group-hover:text-parkongo-700 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div className="absolute -inset-1 bg-parkongo-100/50 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Easy Search",
      description: "Find parking spaces near you with our intuitive map-based search interface."
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Prime Locations",
      description: "Access parking spots in premium locations across the city."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Monthly Bookings",
      description: "Secure your parking space for a month or longer with flexible terms."
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Secure Payments",
      description: "Pay securely online using our trusted payment gateway."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Verified Hosts",
      description: "All parking space owners are verified for your peace of mind."
    },
    {
      icon: <CarFront className="h-8 w-8" />,
      title: "Various Options",
      description: "Choose from covered, open, or private parking spaces based on your needs."
    }
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 h-32 w-64 bg-parkongo-100 rounded-br-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 h-64 w-64 bg-parkongo-50 rounded-tl-full blur-3xl opacity-60" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Parkongo?</h2>
          <p className="text-xl text-gray-600">
            We make finding and booking monthly parking spaces simple, secure, and stress-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
