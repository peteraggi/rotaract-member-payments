"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
// import { auth } from "./auth";

// Form schema validation
const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function Page() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  // const session = await auth();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });
        const data = await response.json();

        // Throw an error if the response isn't OK
        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }

        // Use the flat property 'exists'
        if (data.exists) {
          router.push(`/login?email=${encodeURIComponent(values.email)}`);
        } else {
          router.push(`/auth?email=${encodeURIComponent(values.email)}`);
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#dfe7ef] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-6 text-center bg-gray-50 p-8">
            <div className="flex justify-center ">
              <Image
                src="/rota.png"
                alt="Rotary International"
                width={150}
                height={150}

              />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-500">
              REI #25 Registration
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-center text-gray-600 text-lg">
                Please enter your email address to get started with REI 25 Tree
                Planting Campaign.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              placeholder="Enter your email address"
                              disabled={isPending}
                              type="email"
                              className="py-5 px-4 border-gray-300 rounded-lg text-base pl-10 focus-visible:ring-2 focus-visible:ring-[#1a365d]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {submitError && (
                    <p className="text-red-500 text-sm text-center">
                      {submitError}
                    </p>
                  )}

                  <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-gray-900 text-white hover:bg-[#2c5282] py-5 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    {isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center w-full">
              &copy; 2025 Rotaract Earth Initiative. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
