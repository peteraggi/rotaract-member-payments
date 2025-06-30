'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInResponse } from "next-auth/react";
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { useState, useTransition } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from "react-hot-toast";
// import { signIn } from '@/auth';
import { signIn } from 'next-auth/react'; 

// Form schema validation
const OtpSchema = z.object({
  pin: z.string().length(6, "PIN must be 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = '/registration';
  const email = searchParams.get('email') || '';
  // const { data: session } = useSession({required: true,});

  const form = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      pin: ""
    },
  });

  const handleResendOTP = async () => {
    try {
      await fetch('/api/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
      toast.success("New PIN sent!");
    } catch (error) {
      toast.error("Failed to resend PIN");
    }
  };
  
const onSubmit = (values: z.infer<typeof OtpSchema>) => {
    startTransition(async () => {
      try {
        if (!email) {
          throw new Error("Email is required");
        }
  
        const result = await signIn('credentials', {
          email,
          pinCode: values.pin,
          redirect: false,
          callbackUrl,
        });
  
        if (result?.error) {
          // Parse NextAuth errors
          let userMessage = "Invalid credentials";
          
          if (result.error.includes("PIN has expired")) {
            userMessage = "The PIN has expired. Please request a new one.";
          } else if (result.error.includes("No PIN generated")) {
            userMessage = "No valid PIN exists for this account.";
          } else if (result.error.includes("Invalid PIN")) {
            userMessage = "The PIN you entered is incorrect.";
          } else if (result.error === "CredentialsSignin") {
            userMessage = "Invalid email or PIN";
          }
  
          setError(userMessage);
          toast.error(userMessage);
        } else if (result?.ok) {
          toast.success("Login Successful");
          router.push('/registration'); // Use the callbackUrl here
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        setError(errorMessage);
        toast.error("Network error. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#dfe7ef] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-6 text-center bg-gray-50 p-8">
            <div className="flex justify-center">
              <Image
                src="/rota.png"
                alt="Rotary International"
                width={100}
                height={100}
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Verify Your Identity
            </CardTitle>
            <p className="text-gray-600">
              Enter the 6-digit PIN sent to <strong>{email}</strong>
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6-digit PIN</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            {...field}
                            placeholder="123456"
                            disabled={isPending}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="py-5 px-4 border-gray-300 rounded-lg text-base pl-10 text-center tracking-widest"
                            maxLength={6}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-gray-900 text-white hover:bg-[#2c5282] py-5 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Didn't receive a PIN?{" "}
              <button 
                type="button" 
                className="text-blue-600 hover:underline"
                onClick={() => {
                  // Implement resend OTP logic here
                }}
              >
                Resend PIN
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}