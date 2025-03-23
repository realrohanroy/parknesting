
import React from 'react';
import Button from './Button';
import { Search, MapPin } from 'lucide-react';
import AnimatedImage from './AnimatedImage';
import { cn } from '@/lib/utils';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-24 md:pt-36 md:pb-24 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-parkongo-50/50 to-transparent -z-10" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxODFFMjgiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2Nmg2di02aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Text Content */}
          <div className="max-w-2xl space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight lg:leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Find Monthly <span className="text-parkongo-600">Parking Spaces</span> With Ease
            </h1>
            
            <p className="text-xl text-gray-600 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              The simplest way to find and book long-term parking spots in your city. Secure, convenient, and hassle-free.
            </p>
            
            {/* Search Bar */}
            <div 
              className="flex flex-col sm:flex-row items-center gap-4 max-w-xl mx-auto lg:mx-0 animate-fade-in-up"
              style={{animationDelay: '0.5s'}}
            >
              <div className="relative w-full">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter location or zipcode" 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-parkongo-400 focus:ring focus:ring-parkongo-200 focus:ring-opacity-50 transition-all shadow-sm"
                />
              </div>
              <Button 
                variant="custom" 
                size="lg"
                rightIcon={<Search className="h-4 w-4" />}
                className="w-full sm:w-auto"
                href="/search"
                data-style="accent"
              >
                Search
              </Button>
            </div>
            
            {/* Stats */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 animate-fade-in-up"
              style={{animationDelay: '0.7s'}}
            >
              {['500+ Parking Spots', '5,000+ Happy Users', '10+ Cities'].map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-parkongo-100 flex items-center justify-center mr-3">
                    <div className="h-5 w-5 rounded-full bg-parkongo-500" />
                  </div>
                  <span className="text-gray-700 font-medium">{stat}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="w-full max-w-lg lg:max-w-xl relative">
            {/* Main image with a dynamic shadow and soft animation */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl animate-float">
              <AnimatedImage 
                src="https://images.unsplash.com/photo-1562419988-3e5911dd6eb5?q=80&w=1000&auto=format&fit=crop" 
                alt="Urban parking space"
                className="w-full h-auto rounded-xl"
                animation="fade-in"
                delay={0.2}
              />
              
              {/* Glass overlay with stats */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 p-6 glass-card",
                "bg-white/70 backdrop-blur-md border border-white/20"
              )}>
                <h3 className="font-semibold text-lg mb-2">Discover perfect parking spots</h3>
                <p className="text-gray-700">Monthly rates starting from ₹1,500</p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-parkongo-100 rounded-full blur-2xl opacity-60 animate-pulse-soft" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-parkongo-50 rounded-full blur-3xl opacity-70" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
