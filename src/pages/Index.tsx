
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import { Star, ShieldCheck, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import AnimatedImage from '@/components/AnimatedImage';
import { cn } from '@/lib/utils';

const Index: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Monthly Parker",
      content: "Finding a reliable parking spot near my office was a nightmare until I discovered Parkongo. Now I have a dedicated spot that I can count on every day!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: 2,
      name: "Rahul Mehta",
      role: "Space Host",
      content: "As a host, I'm earning extra income from my unused parking spot. The platform makes it so easy to manage bookings and payments.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      id: 3,
      name: "Anjali Patel",
      role: "Monthly Parker",
      content: "The booking process is seamless, and I love that I can see photos and detailed information about each parking space before booking.",
      rating: 4,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main>
        <Hero />
        <Features />
        
        {/* Testimonial Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-40 -left-40 h-80 w-80 bg-parkongo-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 bg-parkongo-50 rounded-full blur-3xl opacity-50" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
              <span className="inline-block px-3 py-1 bg-parkongo-100 text-parkongo-700 rounded-full text-sm font-medium mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Users Say</h2>
              <p className="text-xl text-gray-600">
                Thousands of users trust Parkongo for their monthly parking needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className={cn(
                    "p-6 rounded-xl hover-lift glass-card",
                    "animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="h-12 w-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-parkongo-600 relative overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em02IDZ2Nmg2di02aC02em0tMTIgMGg2djZoLTZ2LTZ6bTEyIDBoNnY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 z-0" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                <div className="lg:col-span-3 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in-up">
                    Ready to Simplify Your Parking Experience?
                  </h2>
                  <p className="text-xl text-white/80 mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    Join thousands of users who've found their perfect parking solution with Parkongo. Start searching now!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <Button 
                      variant="default" 
                      size="lg"
                      className="bg-white text-parkongo-600 hover:bg-gray-100"
                      href="/search"
                    >
                      Find Parking
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="text-white border-white/30 hover:bg-white/10"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      href="/for-hosts"
                    >
                      List Your Space
                    </Button>
                  </div>
                </div>
                
                <div className="lg:col-span-2 relative">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl max-w-xs mx-auto lg:mx-0 animate-float">
                    <AnimatedImage 
                      src="https://images.unsplash.com/photo-1532939163844-547f958e91b4?q=80&w=800&auto=format&fit=crop" 
                      alt="Parkongo mobile app"
                      className="w-full h-auto rounded-xl"
                      animation="fade-in"
                    />
                    
                    {/* Glass security badge */}
                    <div className={cn(
                      "absolute bottom-4 left-4 right-4 p-4 rounded-lg",
                      "bg-white/20 backdrop-blur-lg border border-white/30"
                    )}>
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-10 w-10 text-white" />
                        <div>
                          <p className="text-white font-medium">100% Secure</p>
                          <p className="text-white/80 text-sm">Verified spaces & secure payments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
