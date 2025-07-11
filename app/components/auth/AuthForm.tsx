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
import { Mail, User } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Form schema validation
const FormSchema = z.object({
  full_name: z.string().min(3, "Name must be at least 3 characters"),
});

export default function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      full_name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/member-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: values.full_name,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }
        setRegisteredEmail(email);
        setShowOtpForm(true);
        router.push(`/login?email=${encodeURIComponent(email)}`);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
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
                src="/logo.png"
                alt="Rotary International"
                width={200}
                height={200}
              />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-center text-gray-600 text-lg">
                Oops! <strong>{email}</strong> doesn't seem to have an account.
                Please tell us your fullname so we can create one.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              {...field}
                              placeholder="e.g Kato John..."
                              disabled={isPending}
                              className="py-5 px-4 border-gray-300 rounded-lg text-base pl-10"
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
                      "continue"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center w-full">
              &copy; By creating an account, you agree to the REI Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
