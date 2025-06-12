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
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';

interface RegistrationFormProps {
    session: Session;
  }
  
const registrationSchema = z.object({
  // BIODATA
  fullName: z.string().min(2, "Full name is required"),
  telephone: z.string().regex(/^\+\d{10,15}$/, "Enter valid phone number with country code"),
  sex: z.string().min(1, "Please select sex"),
  nextOfKin: z.string().min(2, "Next of kin name is required"),
  nextOfKinContact: z.string().min(10, "Valid contact is required"),
  
  // CLUB DETAILS
  delegateType: z.string().min(1, "Please select delegate type"),
  district: z.string().min(1, "District is required"),
  rotaryPosition: z.string().min(1, "Position is required"),
  
  // OTHER INFORMATION
  country: z.string().min(1, "Country is required"),
  dietNeeds: z.string(),
  shirtSize: z.string().min(1, "Shirt size is required"),
  disconRole: z.string(),
});

export default function RegistrationForm({ session }: RegistrationFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      telephone: "+256",
      sex: "",
      nextOfKin: "",
      nextOfKinContact: "",
      delegateType: "",
      district: "RID 9213",
      rotaryPosition: "Club Member",
      country: "",
      dietNeeds: "All food",
      shirtSize: "",
      disconRole: "",
    },
  });
  console.log("Session", session)
  const isSubmitting = form.formState.isSubmitting;


  const onSubmit = (values: z.infer<typeof registrationSchema>) => {
    console.log(values);
    // Handle form submission
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
                {/* BIODATA SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground">
                  BIODATA
                </h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Fullname</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tommy Shelby" 
                          {...field} 
                          className="border-border bg-card text-card-foreground"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Telephone Contact</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+256775xxxxxx" 
                          {...field} 
                          className="border-border bg-card text-card-foreground"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Sex</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border bg-card text-card-foreground">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="Male" className="hover:bg-accent hover:text-accent-foreground">Male</SelectItem>
                          <SelectItem value="Female" className="hover:bg-accent hover:text-accent-foreground">Female</SelectItem>
                          <SelectItem value="Other" className="hover:bg-accent hover:text-accent-foreground">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                {/* CLUB DETAILS SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground pt-4">
                  CLUB DETAILS
                </h3>
                
                <FormField
                  control={form.control}
                  name="delegateType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">This delegate is a</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border bg-card text-card-foreground">
                            <SelectValue placeholder="Select delegate type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="Rotarian" className="hover:bg-accent hover:text-accent-foreground">Rotarian</SelectItem>
                          <SelectItem value="Rotaractor" className="hover:bg-accent hover:text-accent-foreground">Rotaractor</SelectItem>
                          <SelectItem value="Guest" className="hover:bg-accent hover:text-accent-foreground">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">District</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-border bg-card text-card-foreground"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rotaryPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Rotary Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border bg-card text-card-foreground">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="Club Member" className="hover:bg-accent hover:text-accent-foreground">Club Member</SelectItem>
                          <SelectItem value="Club President" className="hover:bg-accent hover:text-accent-foreground">Club President</SelectItem>
                          <SelectItem value="Committee Chair" className="hover:bg-accent hover:text-accent-foreground">Committee Chair</SelectItem>
                          <SelectItem value="District Officer" className="hover:bg-accent hover:text-accent-foreground">District Officer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                {/* OTHER INFORMATION SECTION */}
                <h3 className="text-lg font-semibold text-card-foreground pt-4">
                  OTHER INFORMATION
                </h3>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Country of Residence</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Uganda" 
                          {...field} 
                          className="border-border bg-card text-card-foreground"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Special Diet Needs</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border bg-card text-card-foreground">
                            <SelectValue placeholder="Select diet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="All food" className="hover:bg-accent hover:text-accent-foreground">All food</SelectItem>
                          <SelectItem value="Vegetarian" className="hover:bg-accent hover:text-accent-foreground">Vegetarian</SelectItem>
                          <SelectItem value="Vegan" className="hover:bg-accent hover:text-accent-foreground">Vegan</SelectItem>
                          <SelectItem value="Halal" className="hover:bg-accent hover:text-accent-foreground">Halal</SelectItem>
                          <SelectItem value="Kosher" className="hover:bg-accent hover:text-accent-foreground">Kosher</SelectItem>
                          <SelectItem value="Other" className="hover:bg-accent hover:text-accent-foreground">Other (specify)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shirtSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Shirt/Blouse Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border bg-card text-card-foreground">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-card">
                          <SelectItem value="XS" className="hover:bg-accent hover:text-accent-foreground">XS</SelectItem>
                          <SelectItem value="S" className="hover:bg-accent hover:text-accent-foreground">S</SelectItem>
                          <SelectItem value="M" className="hover:bg-accent hover:text-accent-foreground">M</SelectItem>
                          <SelectItem value="L" className="hover:bg-accent hover:text-accent-foreground">L</SelectItem>
                          <SelectItem value="XL" className="hover:bg-accent hover:text-accent-foreground">XL</SelectItem>
                          <SelectItem value="XXL" className="hover:bg-accent hover:text-accent-foreground">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-destructive" />
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