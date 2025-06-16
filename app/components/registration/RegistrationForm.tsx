'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import toast from 'react-hot-toast';

interface RegistrationFormProps {
    session: Session;
}

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(50),
  phoneNumber: z.string().regex(/^\+\d{10,15}$/, "Enter valid phone number with country code"),
  gender: z.enum(["Male", "Female"]),
  clubName: z.string().min(2, "Club name is required").max(50),
  country: z.string().min(2, "Country is required").max(50),
  designation: z.enum([
    "REI Committee", 
    "REI Club Officer", 
    "President", 
    "District Officer", 
    "Club Member", 
    "Guest"
  ]),
  district: z.enum([
    "District 9212",
    "District 9213",
    "District 9214",
    "Other"
  ]),
  shirtSize: z.enum(["S", "M", "L", "XL", "2XL"]),
  dietaryRestrictions: z.enum(["Vegetarian", "Non Vegetarian"]),
  accommodation: z.enum(["Shared", "Single (with Extra Cost)"]),
});

export default function RegistrationForm({ session }: RegistrationFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "+256",
      gender: "Male",
      clubName: "",
      country: "Uganda",
      designation: "Club Member",
      district: "District 9213",
      shirtSize: "M",
      dietaryRestrictions: "Non Vegetarian",
      accommodation: "Shared",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {      
      const response = await fetch('/api/register-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please check your details and try again.');
      }
  
      toast.success('Registration successful!');
      router.push('/registration/mine');
    } catch (error) {
      toast.dismiss(); // Clear any existing toasts
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (error.message.includes('phone_number')) {
          errorMessage = 'This phone number is already registered. Please use a different number.';
        } else if (error.message.includes('email')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Invalid data submitted. Please check your form entries.';
        }
      }
  
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl font-bold text-card-foreground">
              REI 25 Registration for {session.user?.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* PERSONAL INFORMATION SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground">
                  PERSONAL INFORMATION
                </h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+256775xxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CLUB INFORMATION SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground pt-4">
                  CLUB INFORMATION
                </h3>
                
                <FormField
                  control={form.control}
                  name="clubName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Rotaract Club of..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REI Committee">REI Committee</SelectItem>
                          <SelectItem value="REI Club Officer">REI Club Officer</SelectItem>
                          <SelectItem value="President">President</SelectItem>
                          <SelectItem value="District Officer">District Officer</SelectItem>
                          <SelectItem value="Club Member">Club Member</SelectItem>
                          <SelectItem value="Guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotary District</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="District 9212">District 9212</SelectItem>
                          <SelectItem value="District 9213">District 9213</SelectItem>
                          <SelectItem value="District 9214">District 9214</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* EVENT PREFERENCES SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground pt-4">
                  EVENT PREFERENCES
                </h3>
                
                <FormField
                  control={form.control}
                  name="shirtSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T-Shirt Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="2XL">2XL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dietary preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Non Vegetarian">Non Vegetarian</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accommodation Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accommodation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Shared">Shared Room</SelectItem>
                          <SelectItem value="Single (with Extra Cost)">
                            Single Room (with Extra Cost)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full py-5 mt-6 bg-gray-900 text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}