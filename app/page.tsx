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
import { Mail, ChevronRight, X, Info } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema validation
const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [showRegistrationClosed, setShowRegistrationClosed] = useState(false);

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

        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }

        if (data.exists) {
          // Email exists - allow login
          document.cookie = `authFlow=1; path=/; max-age=${60 * 15}`;
          router.push(`/login?email=${encodeURIComponent(values.email)}`);
        } else {
          // Email doesn't exist - show registration closed popup
          setShowRegistrationClosed(true);
        }
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    });
  };

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/registration");
      }
    }
  }, [status, session, router]);

  return (
    <div className="relative min-h-screen">
      {/* Background image with overlay */}
      <div className="fixed inset-0 -z-10 h-screen w-screen">
        <Image
          src="/rotaract-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          quality={100}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Event Date Banner */}
      {showBanner && (
        <div className="relative z-20">
          <div className="flex items-center justify-center bg-[#2E8B57] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between w-full max-w-7xl gap-2">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-white">
                  <span className="hidden sm:inline">Rotaract Earth Initiative 2025 | </span>
                  <span className="text-yellow-200 font-semibold">
                    Save the Date: 24TH-26TH OCTOBER, 2025
                  </span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={isPosterOpen} onOpenChange={setIsPosterOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-white text-[#1a365d] hover:bg-blue-50 font-medium"
                    >
                      View Event Poster
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <h3 className="text-lg font-medium">Rotaract Earth Initiative 2025</h3>
                    </DialogHeader>
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src="/rotaract-bg.jpg"
                        alt="Rotaract Earth Initiative 2025 Poster"
                        fill
                        className="object-contain rounded-lg"
                        quality={100}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-blue-600/20"
                  onClick={() => setShowBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Closed Popup */}
      <AlertDialog open={showRegistrationClosed} onOpenChange={setShowRegistrationClosed}>
        <AlertDialogContent className="max-w-md bg-white rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Info className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900">
              Registration Closed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-gray-600 space-y-3">
              <p>
                We're sorry, but registration for new members has now closed for the 
                <span className="font-semibold text-green-700"> Rotaract Earth Initiative 2025</span>.
              </p>
              <p>
                Please wait for our next event to join us in making a difference!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-col gap-3 mt-4">
            <AlertDialogAction 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200"
              onClick={() => setShowRegistrationClosed(false)}
            >
              Understood
            </AlertDialogAction>
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium text-lg"
              onClick={() => setShowRegistrationClosed(false)}
            >
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-6 text-center bg-gray-50/80 p-8">
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
            <CardFooter className="p-6 bg-gray-50/80 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center w-full">
                &copy; 2025 Rotaract Earth Initiative. All rights reserved.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}