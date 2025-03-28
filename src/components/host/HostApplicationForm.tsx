
import React, { useState } from 'react';
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

type HostApplicationFormValues = {
  reason: string;
};

export function HostApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<HostApplicationFormValues>({
    defaultValues: {
      reason: '',
    },
  });

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
      // Check if user already has an application
      const { data: existingApplication, error: checkError } = await supabase
        .from('host_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
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
            throw updateError;
          }
          
          toast({
            title: "Application Submitted",
            description: "Your host application has been resubmitted for review.",
          });
        }
      } else {
        // Create new application
        const { error } = await supabase
          .from('host_applications')
          .insert({
            user_id: user.id,
            reason: values.reason,
            status: 'pending'
          });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Application Submitted",
          description: "Your host application has been submitted successfully.",
        });
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
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
