
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useHostApplicationStatus } from '@/hooks/use-host-application-status';

type HostApplicationFormValues = {
  reason: string;
};

export function HostApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { applicationStatus, isLoading, checkStatus } = useHostApplicationStatus();
  
  const form = useForm<HostApplicationFormValues>({
    defaultValues: {
      reason: '',
    },
  });

  // Check existing application status when component mounts
  useEffect(() => {
    if (!user) return;
    
    if (applicationStatus === 'approved') {
      toast({
        title: "Already Approved",
        description: "You are already approved as a host. Redirecting to your dashboard.",
      });
      navigate('/dashboard');
    }
  }, [user, applicationStatus, navigate]);
  
  const onSubmit = async (values: HostApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to apply as a host",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting host application");
      
      // Check if user already has an application
      const { data: existingApplication, error: checkError } = await supabase
        .from('host_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking for existing application:", checkError);
        throw checkError;
      }
      
      // If already submitted, show appropriate message
      if (existingApplication) {
        const status = existingApplication.status;
        if (status === 'pending') {
          toast({
            title: "Application Already Submitted",
            description: "Your host application is currently under review. We'll notify you once it's processed.",
          });
        } else if (status === 'approved') {
          toast({
            title: "Already Approved",
            description: "You are already approved as a host!",
          });
          
          // Double-check that the profile role is set to host
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'host' })
            .eq('id', user.id);
            
          if (profileError) {
            console.error("Error updating profile role:", profileError);
          }
        } else if (status === 'rejected') {
          toast({
            title: "Application Previously Rejected",
            description: "Your previous application was rejected. You can submit a new one now.",
          });
          
          // Allow reapplication for rejected applications
          const { error: updateError } = await supabase
            .from('host_applications')
            .update({
              reason: values.reason,
              status: 'pending',
              processed_by: null,
              processed_at: null,
            })
            .eq('id', existingApplication.id);
          
          if (updateError) {
            console.error("Error updating application:", updateError);
            throw updateError;
          }
          
          toast({
            title: "Application Submitted",
            description: "Your host application has been resubmitted for review.",
          });
          
          // Refresh the status
          await checkStatus();
        }
      } else {
        // Create new application
        console.log("Creating new application");
        const { error } = await supabase
          .from('host_applications')
          .insert({
            user_id: user.id,
            reason: values.reason,
            status: 'pending'
          });
        
        if (error) {
          console.error("Error inserting application:", error);
          throw error;
        }
        
        toast({
          title: "Application Submitted",
          description: "Your host application has been submitted successfully.",
        });
        
        // Refresh the status
        await checkStatus();
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error submitting host application:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Become a Host</CardTitle>
        <CardDescription>
          Apply to become a parking space host and earn money by renting out your parking spaces.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {applicationStatus === 'pending' ? (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-blue-700">Your application is currently under review. We'll notify you when it's processed.</p>
                  </div>
                </div>
              </div>
            ) : applicationStatus === 'rejected' ? (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700">
                      Your previous application was rejected. You can submit a new application below.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to become a host?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your parking space, location, and why you want to join our platform as a host..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide details about your parking space(s) and your expectations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || applicationStatus === 'pending'}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : applicationStatus === 'pending' ? (
                "Application Pending"
              ) : applicationStatus === 'rejected' ? (
                "Resubmit Application"
              ) : (
                "Submit Application"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default HostApplicationForm;
