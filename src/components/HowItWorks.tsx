
import React from 'react';
import Button from './Button';
import AnimatedImage from './AnimatedImage';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Search for parking spaces",
      description: "Enter your desired location and browse available monthly parking spots on our interactive map.",
      delay: 0.1
    },
    {
      number: "02",
      title: "Choose the perfect spot",
      description: "Compare prices, reviews, amenities, and select the parking space that best fits your needs.",
      delay: 0.2
    },
    {
      number: "03",
      title: "Book and pay securely",
      description: "Complete your booking with our secure payment system and receive instant confirmation.",
      delay: 0.3
    },
    {
      number: "04",
      title: "Park with peace of mind",
      description: "Enjoy your dedicated parking space for the duration of your booking with 24/7 customer support.",
      delay: 0.4
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <span className="inline-block px-3 py-1 bg-parkongo-100 text-parkongo-700 rounded-full text-sm font-medium mb-4">
            Seamless Experience
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How Parkongo Works</h2>
          <p className="text-xl text-gray-600">
            Finding and booking monthly parking has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  "flex gap-6 animate-fade-in-up",
                  index === steps.length - 1 ? "" : "relative after:content-[''] after:absolute after:left-6 after:top-16 after:bottom-0 after:w-px after:bg-parkongo-100"
                )}
                style={{ animationDelay: `${step.delay}s` }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-parkongo-100 text-parkongo-700 font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}

            <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Button 
                variant="primary" 
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                href="/search"
              >
                Start Searching
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative lg:order-last order-first mb-12 lg:mb-0">
            <div className="relative rounded-2xl overflow-hidden shadow-xl animate-float">
              <AnimatedImage 
                src="https://images.unsplash.com/photo-1590674899484-13d6c7094a11?q=80&w=1000&auto=format&fit=crop" 
                alt="Mobile app showing parking search"
                className="w-full h-auto rounded-2xl"
                animation="fade-in"
              />
              
              {/* Glass overlay */}
              <div className={cn(
                "absolute top-8 right-8 p-4 glass-card rounded-xl",
                "bg-white/60 backdrop-blur-md border border-white/30 shadow-lg"
              )}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available now</p>
                    <p className="font-medium">10 spots near you</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-parkongo-100 rounded-full blur-2xl opacity-60" />
            <div className="absolute -top-10 -left-10 h-40 w-40 bg-blue-50 rounded-full blur-3xl opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
