'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';

// Country codes configuration
const COUNTRY_CODES = [
  { code: '+256', country: 'Uganda', networks: ['MTN', 'Airtel', 'Uganda Telecom', 'Africell'] },
  { code: '+254', country: 'Kenya', networks: ['M-Pesa', 'Airtel Money', 'Safaricom'] },
];

const formSchema = z.object({
  amount: z.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a number',
  }).min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(["bank", "mobile_money"], {
    required_error: "Please select a payment method",
  }),
  bankName: z.string().optional().superRefine((val, ctx) => {
    const { paymentMethod } = ctx as any;
    if ((ctx as any).paymentMethod === "bank" && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bank name is required for bank transfers",
      });
    }
  }),
  accountNumber: z.string().optional().superRefine((val, ctx) => {
    if ((ctx as any).paymentMethod === "bank" && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number is required for bank transfers",
      });
    } else if ((ctx as any).paymentMethod === "bank" && val && val.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number must be at least 10 characters",
      });
    }
  }),
  countryCode: z.string().optional().superRefine((val, ctx) => {
    if ((ctx as any).paymentMethod === "mobile_money" && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country code is required for mobile money",
      });
    }
  }),
  mobileNumber: z.string().optional().superRefine((val, ctx) => {
    if ((ctx as any).paymentMethod === "mobile_money" && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile number is required for mobile money",
      });
    } else if ((ctx as any).paymentMethod === "mobile_money" && val) {
      const countryCode = (ctx as any).countryCode;
      let isValid = true;
      
      if (countryCode === '+256') { // Uganda
        isValid = /^\d{9}$/.test(val); // 9 digits without leading 0
      } else if (countryCode === '+254') { // Kenya
        isValid = /^\d{9}$/.test(val); // 9 digits without leading 0
      }
      
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid mobile number format for selected country",
        });
      }
    }
  }),
  network: z.string().optional().superRefine((val, ctx) => {
    if ((ctx as any).paymentMethod === "mobile_money" && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile network is required",
      });
    }
  }),
  accountName: z.string().min(1, 'Account name is required'),
  reason: z.string()
    .min(1, 'Reason is required')
    .min(20, 'Reason must be at least 20 characters'),
  disbursementDate: z.date({
    required_error: 'Disbursement date is required',
  }).min(new Date(), 'Disbursement date must be in the future'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LiquidationRequestForm({ session }: { session: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: undefined,
      accountNumber: '',
      accountName: '',
      bankName: '',
      countryCode: '+256', // Default to Uganda
      mobileNumber: '',
      network: '',
      reason: '',
    },
  });

  const selectedPaymentMethod = form.watch("paymentMethod");
  const selectedCountryCode = form.watch("countryCode");
  const selectedNetwork = form.watch("network");

  // Get available networks for selected country
  const availableNetworks = COUNTRY_CODES.find(country => country.code === selectedCountryCode)?.networks || [];

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const requestData: any = {
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          accountName: values.accountName,
          reason: values.reason,
          disbursementDate: values.disbursementDate,
          requesterId: session.user.user_id,
          requesterName: session.user.name,
          ...(values.paymentMethod === "bank" ? {
            bankName: values.bankName,
            accountNumber: values.accountNumber,
            mobileNumber: null,
            network: null,
            countryCode: null,
          } : {
            bankName: null,
            accountNumber: null,
            mobileNumber: values.mobileNumber,
            network: values.network,
            countryCode: values.countryCode,
          })
        };

        const response = await fetch('/api/liquidation-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit liquidation request');
        }

        toast.success('Liquidation request submitted successfully!');
        setIsSuccess(true);
        form.reset();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#dfe7ef] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-6 text-center bg-gray-50 p-8">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Request Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-6">
              Your liquidation request has been submitted successfully.
            </p>
            <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Next Steps:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>The finance team will review your request</li>
                <li>You'll receive a confirmation email</li>
                <li>Approval typically takes 2-3 business days</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-gray-50 border-t border-gray-200">
            <Button 
              onClick={() => setIsSuccess(false)}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Submit Another Request
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#dfe7ef] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-6 text-center bg-gray-50 p-8">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Fund Liquidation Request Form
            </CardTitle>
            <p className="text-gray-600">
              Request disbursement of funds for approved expenses
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (UGX)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              UGX
                            </span>
                            <Input
                              value={field.value}
                              placeholder="Enter amount"
                              className="pl-12"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value ? Number(value) : 0);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              if (e.target.value === "bank") {
                                form.resetField("mobileNumber");
                                form.resetField("network");
                                form.resetField("countryCode");
                              } else {
                                form.resetField("bankName");
                                form.resetField("accountNumber");
                                form.setValue("countryCode", "+256"); // Reset to default
                              }
                            }}
                          >
                            <option value="">Select payment method</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="mobile_money">Mobile Money</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedPaymentMethod === "bank" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter bank name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter account number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {selectedPaymentMethod === "mobile_money" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    // Reset network and mobile number when country changes
                                    form.resetField("network");
                                    form.resetField("mobileNumber");
                                  }}
                                >
                                  {COUNTRY_CODES.map((country) => (
                                    <option key={country.code} value={country.code}>
                                      {country.country} ({country.code})
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="network"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Network</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <select
                                  {...field}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                  <option value="">Select network</option>
                                  {availableNetworks.map((network) => (
                                    <option key={network} value={network}>
                                      {network}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="w-32">
                                <div className="relative">
                                  <Input
                                    value={selectedCountryCode}
                                    disabled
                                    className="text-center font-medium bg-gray-50"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <Input
                                  {...field}
                                  placeholder={
                                    selectedCountryCode === '+256' ? "712345678" :
                                    selectedCountryCode === '+254' ? "712345678" :
                                    selectedCountryCode === '+255' ? "712345678" :
                                    selectedCountryCode === '+250' ? "712345678" : "Enter mobile number"
                                  }
                                  onChange={(e) => {
                                    // Allow only numbers and limit based on country
                                    const value = e.target.value.replace(/\D/g, '');
                                    let maxLength = 9; // Default for East Africa
                                    
                                    // You can add different length validations per country if needed
                                    field.onChange(value.slice(0, maxLength));
                                  }}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Helper text for number format */}
                    <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium">Number Format Guide:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Uganda (+256): Enter 9 digits without 0 (e.g., 712345678 for 0712345678)</li>
                        <li>• Kenya (+254): Enter 9 digits without 0 (e.g., 712345678 for 0712345678)</li>
                      </ul>
                    </div>
                  </>
                )}

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedPaymentMethod === "mobile_money" 
                          ? "Recipient Name" 
                          : "Account Name"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={
                            selectedPaymentMethod === "mobile_money" 
                              ? "Enter recipient name" 
                              : "Enter account holder name"
                          } 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Liquidation</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide detailed explanation for this liquidation request..."
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disbursementDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Disbursement Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            className="pl-10"
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin')}
                    disabled={isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6 border border-gray-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50 p-6">
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                For questions about liquidation requests, please contact:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Rotaract Top Admin</p>
                <p className="text-sm text-gray-600">alebarkm@gmail.com</p>
                <p className="text-sm text-gray-600">+256 778 107764</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Typical processing time: 2-3 business days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}