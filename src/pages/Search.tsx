
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { 
  Search as SearchIcon, 
  MapPin, 
  Calendar, 
  Filter, 
  Star, 
  Car, 
  ShieldCheck, 
  Clock, 
  Wifi, 
  CameraIcon, 
  Layers,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for parking spots
const PARKING_SPOTS = [
  {
    id: 1,
    title: "Secure Covered Parking Near MG Road",
    location: "MG Road, Bangalore",
    price: 2500,
    rating: 4.8,
    reviews: 24,
    images: ["https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=800&auto=format&fit=crop"],
    features: ["Covered", "24/7 Access", "Security Camera", "Gated"],
    host: {
      name: "Vikram S.",
      image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      responseTime: "Within an hour"
    }
  },
  {
    id: 2,
    title: "Underground Parking in Premium Apartment",
    location: "Indiranagar, Bangalore",
    price: 3000,
    rating: 4.9,
    reviews: 42,
    images: ["https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?q=80&w=800&auto=format&fit=crop"],
    features: ["Underground", "24/7 Access", "Security Camera", "Gated"],
    host: {
      name: "Priya M.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      responseTime: "Within 2 hours"
    }
  },
  {
    id: 3,
    title: "Open Parking Space in Residential Society",
    location: "Koramangala, Bangalore",
    price: 2000,
    rating: 4.6,
    reviews: 18,
    images: ["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=800&auto=format&fit=crop"],
    features: ["Open", "24/7 Access", "Gated"],
    host: {
      name: "Raj K.",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      responseTime: "Same day"
    }
  },
  {
    id: 4,
    title: "Covered Parking in Corporate Complex",
    location: "Whitefield, Bangalore",
    price: 3200,
    rating: 4.7,
    reviews: 31,
    images: ["https://images.unsplash.com/photo-1593280405106-e438854a958f?q=80&w=800&auto=format&fit=crop"],
    features: ["Covered", "24/7 Access", "Security Camera", "Gated", "Electric Charging"],
    host: {
      name: "Sneha R.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      responseTime: "Within an hour"
    }
  },
  {
    id: 5,
    title: "Basement Parking in Luxury Apartment",
    location: "JP Nagar, Bangalore",
    price: 2800,
    rating: 4.5,
    reviews: 15,
    images: ["https://images.unsplash.com/photo-1591955506264-3f5a6834570a?q=80&w=800&auto=format&fit=crop"],
    features: ["Underground", "24/7 Access", "Security Camera", "Gated"],
    host: {
      name: "Aditya P.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      responseTime: "Within a day"
    }
  }
];

type FilterOption = {
  type: 'checkbox' | 'radio' | 'range';
  label: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  key: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  {
    type: 'checkbox',
    label: 'Parking Type',
    key: 'parkingType',
    options: [
      { value: 'covered', label: 'Covered' },
      { value: 'underground', label: 'Underground' },
      { value: 'open', label: 'Open' },
    ],
  },
  {
    type: 'checkbox',
    label: 'Amenities',
    key: 'amenities',
    options: [
      { value: 'security-camera', label: 'Security Camera' },
      { value: 'gated', label: 'Gated' },
      { value: '24-7-access', label: '24/7 Access' },
      { value: 'electric-charging', label: 'Electric Charging' },
      { value: 'valet', label: 'Valet Service' },
    ],
  },
  {
    type: 'range',
    label: 'Price Range',
    key: 'priceRange',
    min: 1000,
    max: 5000,
  },
  {
    type: 'radio',
    label: 'Rating',
    key: 'rating',
    options: [
      { value: 'any', label: 'Any' },
      { value: '4+', label: '4+ Stars' },
      { value: '4.5+', label: '4.5+ Stars' },
    ],
  },
];

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 bg-gray-50">
        {/* Search Header */}
        <div className="bg-parkongo-600 text-white py-12">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in-up">
              Find Your Perfect Parking Space
            </h1>
            <div className="max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white p-1 rounded-lg shadow-lg flex flex-col md:flex-row">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by location or area" 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="md:w-auto w-full md:mt-0 mt-2">
                  <Button 
                    variant="default" 
                    size="lg"
                    className="w-full"
                    rightIcon={<SearchIcon className="h-4 w-4" />}
                    customStyle="accent"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Results */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {PARKING_SPOTS.length} spaces available
              </h2>
              <p className="text-gray-500">in Bangalore</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                rightIcon={<Filter className="h-4 w-4" />}
              >
                Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar - Mobile Version */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex justify-end">
                <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Filters</h3>
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {FILTER_OPTIONS.map((filter, index) => (
                      <div key={index} className="pb-6 border-b border-gray-200 last:border-0">
                        <h4 className="font-medium mb-4">{filter.label}</h4>
                        
                        {filter.type === 'checkbox' && filter.options && (
                          <div className="space-y-2">
                            {filter.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-parkongo-600 focus:ring-parkongo-500 mr-2" 
                                />
                                <span>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {filter.type === 'radio' && filter.options && (
                          <div className="space-y-2">
                            {filter.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input 
                                  type="radio" 
                                  name={filter.key}
                                  className="text-parkongo-600 focus:ring-parkongo-500 mr-2" 
                                />
                                <span>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {filter.type === 'range' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span>₹{filter.min}</span>
                              <span>₹{filter.max}</span>
                            </div>
                            <input 
                              type="range" 
                              min={filter.min} 
                              max={filter.max}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      Reset
                    </Button>
                    <Button variant="default" className="flex-1" onClick={() => setIsFilterOpen(false)} customStyle="primary">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter Sidebar - Desktop Version */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-6">Filters</h3>
                
                <div className="space-y-6">
                  {FILTER_OPTIONS.map((filter, index) => (
                    <div key={index} className="pb-6 border-b border-gray-200 last:border-0">
                      <h4 className="font-medium mb-4">{filter.label}</h4>
                      
                      {filter.type === 'checkbox' && filter.options && (
                        <div className="space-y-2">
                          {filter.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="rounded text-parkongo-600 focus:ring-parkongo-500 mr-2" 
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {filter.type === 'radio' && filter.options && (
                        <div className="space-y-2">
                          {filter.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center">
                              <input 
                                type="radio" 
                                name={filter.key}
                                className="text-parkongo-600 focus:ring-parkongo-500 mr-2" 
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {filter.type === 'range' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span>₹{filter.min}</span>
                            <span>₹{filter.max}</span>
                          </div>
                          <input 
                            type="range" 
                            min={filter.min} 
                            max={filter.max}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    Reset
                  </Button>
                  <Button variant="default" className="flex-1" customStyle="primary">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Parking Spots */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PARKING_SPOTS.map((spot, index) => (
                  <div 
                    key={spot.id}
                    className={cn(
                      "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift cursor-pointer",
                      "animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    onClick={() => navigate(`/parking/${spot.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={spot.images[0]} 
                        alt={spot.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-sm">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{spot.rating}</span>
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-gray-500">{spot.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800">{spot.title}</h3>
                      
                      <div className="flex items-center text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{spot.location}</span>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {spot.features.map((feature, fIndex) => (
                          <span 
                            key={fIndex}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-parkongo-50 text-parkongo-700"
                          >
                            {feature === 'Covered' && <Car className="h-3 w-3 mr-1" />}
                            {feature === 'Underground' && <Layers className="h-3 w-3 mr-1" />}
                            {feature === 'Open' && <Layers className="h-3 w-3 mr-1" />}
                            {feature === 'Security Camera' && <CameraIcon className="h-3 w-3 mr-1" />}
                            {feature === 'Gated' && <ShieldCheck className="h-3 w-3 mr-1" />}
                            {feature === '24/7 Access' && <Clock className="h-3 w-3 mr-1" />}
                            {feature === 'Electric Charging' && <Wifi className="h-3 w-3 mr-1" />}
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <img 
                            src={spot.host.image} 
                            alt={spot.host.name}
                            className="h-8 w-8 rounded-full mr-2 object-cover" 
                          />
                          <span className="text-sm text-gray-600">{spot.host.name}</span>
                        </div>
                        <div className="font-semibold text-lg">
                          ₹{spot.price}<span className="text-gray-500 text-sm font-normal">/month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
