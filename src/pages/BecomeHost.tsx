
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HostApplicationForm from '@/components/host/HostApplicationForm';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BecomeHost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply as a host",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check if user is already a host
    const checkHostStatus = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profile && profile.role === 'host') {
          toast({
            title: "Already a Host",
            description: "You are already registered as a host.",
          });
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error checking host status:", err);
      }
    };

    checkHostStatus();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Become a Host</h1>
            <p className="mt-2 text-gray-600">
              Share your parking space and earn extra income
            </p>
          </div>
          
          <HostApplicationForm />
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-3">Benefits of becoming a host</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Generate passive income from your unused parking space</li>
              <li>Help solve parking issues in your community</li>
              <li>Choose your own availability and pricing</li>
              <li>Our platform handles bookings and payments securely</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeHost;
