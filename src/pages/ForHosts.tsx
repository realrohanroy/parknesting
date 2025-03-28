
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useHostApplicationStatus } from '@/hooks/use-host-application-status';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ForHosts = () => {
  const { user } = useAuth();
  const { applicationStatus, isLoading } = useHostApplicationStatus();

  const renderApplicationButton = () => {
    if (!user) {
      return (
        <Link to="/auth">
          <Button size="lg" className="mt-8">Sign In to Apply</Button>
        </Link>
      );
    }

    if (isLoading) {
      return (
        <Button size="lg" className="mt-8" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking status...
        </Button>
      );
    }

    switch (applicationStatus) {
      case 'approved':
        return (
          <div className="mt-8 flex items-center gap-3">
            <Badge className="bg-green-500">Approved Host</Badge>
            <Link to="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </div>
        );
      case 'pending':
        return (
          <div className="mt-8 flex flex-col items-center">
            <Badge className="bg-yellow-500 mb-2">Application Pending</Badge>
            <p className="text-sm text-gray-600">Your application is under review. We'll notify you once it's processed.</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="mt-8 flex flex-col items-center gap-2">
            <Badge className="bg-red-500 mb-2">Application Rejected</Badge>
            <Link to="/become-host">
              <Button size="lg">Apply Again</Button>
            </Link>
          </div>
        );
      case 'none':
      default:
        return (
          <Link to="/become-host">
            <Button size="lg" className="mt-8">Apply to Become a Host</Button>
          </Link>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-r from-parkongo-700 to-parkongo-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Become a ParkOnGo Host</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Turn your empty parking space into income. Join our platform and start earning money from your unused parking spots.
            </p>
            {renderApplicationButton()}
          </div>
        </section>

        {/* Benefits section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits of Becoming a Host</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-3">Earn Extra Income</h3>
                <p>Generate passive income by renting out your unused parking space. Set your own rates and availability.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-3">Easy Management</h3>
                <p>Our platform handles bookings, payments, and customer service. Just approve bookings and collect earnings.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-3">Flexible Schedule</h3>
                <p>Choose when your space is available. Rent out your space full-time or just during specific hours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-start mb-10 gap-6">
                <div className="bg-parkongo-100 rounded-full p-4 flex items-center justify-center h-12 w-12 flex-shrink-0">
                  <span className="font-bold text-parkongo-700">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Apply to Become a Host</h3>
                  <p>Submit your application with details about your parking space. We'll review your application and get back to you quickly.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start mb-10 gap-6">
                <div className="bg-parkongo-100 rounded-full p-4 flex items-center justify-center h-12 w-12 flex-shrink-0">
                  <span className="font-bold text-parkongo-700">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">List Your Parking Space</h3>
                  <p>Once approved, create your listing with photos, availability, and pricing. Make your space stand out with a detailed description.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start mb-10 gap-6">
                <div className="bg-parkongo-100 rounded-full p-4 flex items-center justify-center h-12 w-12 flex-shrink-0">
                  <span className="font-bold text-parkongo-700">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Receive Bookings</h3>
                  <p>Drivers will book your space through our platform. You'll be notified of new bookings and can manage them from your dashboard.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-parkongo-100 rounded-full p-4 flex items-center justify-center h-12 w-12 flex-shrink-0">
                  <span className="font-bold text-parkongo-700">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
                  <p>We handle all payments and transfer your earnings directly to your account. Easy, secure, and reliable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-parkongo-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Join thousands of hosts already earning money from their unused parking spaces.
            </p>
            {renderApplicationButton()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ForHosts;
