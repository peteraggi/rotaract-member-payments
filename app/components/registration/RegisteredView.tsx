"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface RegistrationData {
  user: {
    fullName: string;
    phone_number: string | null;
    club_name: string | null;
    email: string;
    t_shirt_size?: string;
    dietary_needs?: string;
  };
  registration: {
    registration_status: string;
    amount_paid: number;
    balance: number;
    payment_status: string;
  };
}

export default function RegisteredView() {
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"mobileMoney" | "card">("mobileMoney");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/check-registration");
        if (!res.ok) throw new Error("Failed to fetch registration data");

        const json = await res.json();
        console.log("Fetched registration data:", json); // Debug log
        
        if (!json.isRegistered || !json.user) {
          router.push("/registration");
          return;
        }

        setData({
          user: {
            fullName: json.user.fullName,
            phone_number: json.user.phone_number,
            club_name: json.user.club_name,
            email: json.user.email,
            t_shirt_size: json.user.t_shirt_size,
            dietary_needs: json.user.dietary_needs,
          },
          registration: {
            registration_status: json.registration.registration_status,
            amount_paid: json.registration.amount_paid,
            balance: json.registration.balance,
            payment_status: json.registration.payment_status,
          },
        });

        // Pre-fill phone number if available
        if (json.user.phone_number) {
          const formattedNumber = `${json.user.phone_number.slice(1)}`;
          console.log("Formatted phone number:", formattedNumber); // Debug log
          setPhoneNumber(formattedNumber);
        }
      } catch (error) {
        console.error("Error fetching registration data:", error); // Debug log
        toast.error("Failed to load registration data");
        router.push("/registration");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const handlePayment = async () => {
    if (!data) {
      console.error("No registration data available"); // Debug log
      return;
    }

    // Show popup for card payments
    if (paymentMethod === "card") {
      setShowCardPopup(true);
      return;
    }

    console.log("Payment data:", { // Debug log
      amount,
      phoneNumber,
      paymentMethod
    });

    // Validate phone number
    const phoneRegex = /^256(77|78|70|75|76|74|39)\d{7}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.error("Invalid phone number format:", phoneNumber); // Debug log
      toast.error("Please enter a valid MTN or Airtel Uganda number starting with 256");
      return;
    }

    if (data.registration.balance <= 0) {
      console.error("Invalid payment amount:", data.registration.balance); // Debug log
      toast.error("Payment amount must be greater than 0");
      return;
    }

    setPaymentStatus("processing");
    setPaymentLoading(true);

    try {
      console.log("Sending payment request..."); // Debug log
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: amount,
          phoneNumber: phoneNumber,
          paymentMethod: paymentMethod,
        }),
      });

      const result = await response.json();
      console.log("Payment API response:", result); // Debug log

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }

      if (result.transactionId) {
        console.log("Transaction ID received:", result.transactionId); // Debug log
        setTransactionId(result.transactionId);
        toast.success("Payment request sent. Please approve on your phone.");

        // Start polling for payment status
        const interval = setInterval(async () => {
          try {
            console.log("Checking payment status..."); // Debug log
            const statusResponse = await fetch("/api/check-payment-status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                transactionId: result.transactionId,
              }),
            });

            const statusResult = await statusResponse.json();
            console.log("Payment status check result:", statusResult); // Debug log

            if (statusResult.status === "SUCCESS") {
              console.log("Payment successful!"); // Debug log
              clearInterval(interval);
              setPaymentStatus("success");
              setPaymentLoading(false);
              toast.success("Payment confirmed!");
              router.refresh();
            } else if (statusResult.status === "FAILED") {
              console.log("Payment failed"); // Debug log
              clearInterval(interval);
              setPaymentStatus("failed");
              setPaymentLoading(false);
              toast.error("Payment failed. Please try again.");
            }
          } catch (error) {
            console.error("Status check error:", error);
          }
        }, 3000); // Poll every 3 seconds

        setPollingInterval(interval);
      }
    } catch (error) {
      console.error("Payment processing error:", error); // Debug log
      setPaymentStatus("failed");
      setPaymentLoading(false);
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }


  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No registration data found.</p>
      </div>
    );
  }

  const totalAmount = data.registration.amount_paid + data.registration.balance;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              {data.registration.registration_status === "registered"
                ? "Registration Details"
                : "Pending Registration"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Member Details */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm border">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-medium">
                      Member Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-baseline gap-2">
                      <Label className="text-gray-500 text-sm">
                        Full Name:
                      </Label>
                      <p className="font-medium">{data.user.fullName}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Label className="text-gray-500 text-sm">Email:</Label>
                      <p>{data.user.email}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Label className="text-gray-500 text-sm">Phone:</Label>
                      <p>{data.user.phone_number || "Not provided"}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Label className="text-gray-500 text-sm">Club:</Label>
                      <p>{data.user.club_name || "Not specified"}</p>
                    </div>
                    {data.user.t_shirt_size && (
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Shirt Size:
                        </Label>
                        <p>{data.user.t_shirt_size}</p>
                      </div>
                    )}
                    {data.user.dietary_needs && (
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Dietary Needs:
                        </Label>
                        <p>{data.user.dietary_needs}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment Section */}
              <div className="lg:col-span-3">
                <Card className="shadow-sm border">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-medium">
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">Status:</Label>
                        <p
                          className={`font-medium ${
                            data.registration.payment_status === "pending"
                              ? "text-orange-500"
                              : "text-green-500"
                          }`}
                        >
                          {data.registration.payment_status.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Amount Paid:
                        </Label>
                        <p>
                          UGX {data.registration.amount_paid.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Total Amount:
                        </Label>
                        <p>UGX {totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Balance:
                        </Label>
                        <p className="font-medium">
                          UGX {data.registration.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {data.registration.balance > 0 && (
                      <>
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("mobileMoney")}
                              className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                                paymentMethod === "mobileMoney"
                                  ? "border-blue-500 bg-white shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                    paymentMethod === "mobileMoney"
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === "mobileMoney" && (
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  )}
                                </div>
                                <div>
                                  <Label className="font-medium">
                                    Mobile Money
                                  </Label>
                                  <p className="text-sm text-gray-500">
                                    🇺🇬 Pay with MTN/Airtel Uganda
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMethod("card")}
                              className={`flex-1 p-4 border rounded-lg text-left transition-colors ${
                                paymentMethod === "card"
                                  ? "border-blue-500 bg-white shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                    paymentMethod === "card"
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === "card" && (
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  )}
                                </div>
                                <div>
                                  <Label className="font-medium">
                                    Credit/Debit Card
                                  </Label>
                                  <p className="text-sm text-gray-500">
                                    Pay with Visa, Mastercard, etc.
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>

                          {paymentMethod === "mobileMoney" && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <div>
                                <Label>Telephone Number (MTN/Airtel UG)</Label>
                                <Input
                                  type="tel"
                                  placeholder="e.g. 785721293"
                                  value={phoneNumber}
                                  onChange={(e) =>
                                    setPhoneNumber(e.target.value)
                                  }
                                  className="mt-1 bg-white"
                                />
                              </div>
                              <div>
                                <Label>Amount (UGX)</Label>
                                <Input
                                  type="text"
                                  value={amount}
                                  onChange={(e) =>
                                    setAmount(e.target.value)
                                  }
                                  // readOnly
                                  className="mt-1 bg-white font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {paymentMethod === "card" && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <div>
                                <Label>Card Number</Label>
                                <Input
                                  type="text"
                                  placeholder="4242 4242 4242 4242"
                                  className="mt-1 bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Expiry Date</Label>
                                  <Input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="mt-1 bg-white"
                                  />
                                </div>
                                <div>
                                  <Label>CVV</Label>
                                  <Input
                                    type="text"
                                    placeholder="123"
                                    className="mt-1 bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Amount (UGX)</Label>
                                <Input
                                  type="text"
                                  value={data.registration.balance.toLocaleString()}
                                  readOnly
                                  className="mt-1 bg-white font-medium"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={handlePayment}
                          className="w-full bg-gray-900 hover:bg-blue-700 py-6 text-lg"
                          disabled={
                            paymentLoading || paymentStatus === "processing"
                          }
                        >
                          {paymentLoading || paymentStatus === "processing" ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            `Pay UGX ${data.registration.balance.toLocaleString()}`
                          )}
                        </Button>
                      </>
                    )}

                    <div className="text-center text-sm text-gray-500">
                      <p>All payments are secure and encrypted</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showCardPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Credit Card Icon */}
              <div className="bg-blue-100 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800">
                Credit/Debit Card Payments
              </h3>

              {/* Message */}
              <p className="text-gray-600">
                Credit/Debit card payments are not yet available at the moment.
                Please contact us for assistance or try Mobile Money payment.
              </p>

              {/* Close Button */}
              <button
                onClick={() => setShowCardPopup(false)}
                className="mt-4 w-full bg-gray-900 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Contact Customer Support
              </button>

              {/* Mobile Money Suggestion */}
              <button
                onClick={() => {
                  setPaymentMethod("mobileMoney");
                  setShowCardPopup(false);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
              >
                Or switch to Mobile Money payment
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "processing" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-100 p-4 rounded-full animate-pulse">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                Processing Payment
              </h3>

              <p className="text-gray-600">
                We've sent a payment request to {phoneNumber}. Please check your
                phone and approve the payment.
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                  style={{ width: "45%" }}
                ></div>
              </div>

              <p className="text-sm text-gray-500">
                This may take a few moments...
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                Payment Successful!
              </h3>

              <p className="text-gray-600">
                Your payment of UGX {data.registration.balance.toLocaleString()}
                has been received successfully.
              </p>

              <Button
                onClick={() => {
                  setPaymentStatus("idle");
                  router.refresh();
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 py-3"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "failed" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                Payment Failed
              </h3>

              <p className="text-gray-600">
                We couldn't process your payment. Please try again or contact
                support.
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => setPaymentStatus("idle")}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() =>
                    (window.location.href = "mailto:support@conference.org")
                  }
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
