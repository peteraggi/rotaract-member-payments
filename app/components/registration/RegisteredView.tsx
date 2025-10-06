"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface RegistrationData {
  user: {
    user_id: number;
    fullName: string;
    phone_number: string | null;
    club_name: string | null;
    email: string;
    t_shirt_size?: string;
    dietary_needs?: string;
    special_medical_conditions?: string;
    accommodation?: string;
  };
  registration: {
    id: number;
    registration_status: string;
    amount_paid: number;
    balance: number;
    payment_status: string;
  };
}

interface PaymentDetails {
  internalReference?: string;
  customerReference?: string;
  provider?: string;
  amount?: number;
  msisdn?: string;
  providerTransactionId?: string;
  completedAt?: string;
}

// const CustomToast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
//   <div className={`max-w-xs md:max-w-sm break-words flex items-start gap-2 p-3 rounded-md ${
//     type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
//   }`}>
//     {type === 'success' ? (
//       <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
//     ) : (
//       <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
//     )}
//     <span>{message}</span>
//   </div>
// );
const CustomToast = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) => (
  <div className="flex items-start gap-2">
    {type === "success" ? (
      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
    ) : (
      <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
    )}
    <span>{message}</span>
  </div>
);

export default function RegisteredView() {
  const [data, setData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"mobileMoney" | "card">(
    "mobileMoney"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  // const [amount, setAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState(0);
  const [totalAmounts, setTotalAmounts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/check-registration");
        if (!res.ok) throw new Error("Failed to fetch registration data");

        const json = await res.json();

        if (!json.isRegistered || !json.user) {
          router.push("/registration");
          return;
        }

        setData({
          user: {
            user_id: json.user.user_id,
            fullName: json.user.fullName,
            phone_number: json.user.phone_number,
            club_name: json.user.club_name,
            email: json.user.email,
            t_shirt_size: json.user.t_shirt_size,
            dietary_needs: json.user.dietary_needs,
            special_medical_conditions: json.user.special_medical_conditions,
            accommodation: json.user.accommodation,
          },
          registration: {
            id: json.registration.id,
            registration_status: json.registration.registration_status,
            amount_paid: json.registration.amount_paid,
            balance: json.registration.balance,
            payment_status: json.registration.payment_status,
          },
        });

        if (json.user.phone_number) {
          const formattedNumber = json.user.phone_number.startsWith("+")
            ? json.user.phone_number.slice(1)
            : json.user.phone_number;
          setPhoneNumber(formattedNumber);
        }
      } catch (error) {
        console.error("Error fetching registration data:", error);
        toast.error("Failed to load registration data");
        router.push("/registration");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const UgandaFlag = () => (
    <span role="img" aria-label="Uganda">
      🇺🇬
    </span>
  );

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const checkPaymentStatus = async (internalReference: string) => {
    try {
      const response = await fetch(
        `/api/check-payment-status?internal_reference=${encodeURIComponent(internalReference)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status check failed");
      }

      return {
        success: result.success,
        status: result.status,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error("Status check error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Status check failed",
      };
    }
  };

const savePaymentToDB = async (paymentData: {
  userId: number;
  amount: number;
  transactionId: string;
  registrationId: number;
  phoneNumber?: string;
}) => {
  try {
    console.log('Saving payment with data:', paymentData);
    
    const response = await fetch("/api/save-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        userId: paymentData.userId,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        paymentMethod: "mobile_money",
        registrationId: paymentData.registrationId,
        phoneNumber: paymentData.phoneNumber,
      }),
    });

    const result = await response.json();
    console.log('Save payment response:', result);

    if (!response.ok) {
      // Handle the correct error format - use result.message instead of result.error
      const errorMessage = result.message || result.error || "Failed to save payment record";
      console.error("Save payment error details:", result);
      throw new Error(errorMessage);
    }

    console.log('Payment saved successfully:', result);
    return result;
  } catch (error) {
    console.error("Save payment error:", error);
    throw error;
  }
};

  const sendPaymentConfirmation = async (paymentData: {
    email: string;
    fullName: string;
    amountPaid: number;
    balance: number;
    totalAmount: number;
    paymentMethod: string;
    transactionId: string;
  }) => {
    try {
      const response = await fetch("/api/send-payment-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!data) {
      toast.error("No registration data available");
      return;
    }

    if (paymentMethod === "card") {
      setShowCardPopup(true);
      return;
    }

    const phoneRegex = /^256(77|78|70|75|76|74|39)\d{7}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error(
        "Please enter a valid MTN or Airtel Uganda number starting with 256"
      );
      return;
    }

    if (data.registration.balance <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    setPaymentStatus("processing");
    setPaymentLoading(true);

    const paymentTimeout = setTimeout(() => {
      if (paymentStatus === "processing") {
        setPaymentStatus("failed");
        setPaymentLoading(false);
        if (pollingInterval) clearInterval(pollingInterval);
        toast.error(
          <CustomToast
            message="Payment timed out. Please check your phone and try again."
            type="error"
          />
        );
      }
    }, 20000); // 20 seconds

     const startTime = Date.now();

    try {
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: Number(totalAmounts),
          phoneNumber: phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Payment failed");
      }

      setPaymentDetails({
        internalReference: result.internalReference,
        customerReference: result.customerReference,
        provider: result.provider,
        amount: Number(amount),
        msisdn: `+${phoneNumber}`,
      });

      toast.success(
        result.message || "Payment request sent. Please approve on your phone."
      );

      // const pollStatus = async () => {
      //   if (!result.internalReference) return;

      //   const statusResult = await checkPaymentStatus(result.internalReference);

      //   if (!statusResult.success) {
      //     throw new Error(statusResult.message);
      //   }

      //   if (statusResult.status === "success") {
      //     clearInterval(interval);

      //     // Save payment to database
      //     await savePaymentToDB({
      //       userId: data.user.user_id,
      //       amount: Number(amount),
      //       transactionId: result.internalReference,
      //       registrationId: data.registration.id,
      //     });

      //     // Send payment confirmation email
      //     await fetch("/api/send-payment-email", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({
      //         email: data.user.email,
      //         fullName: data.user.fullName,
      //         amountPaid: Number(amount),
      //         balance: data.registration.balance - Number(amount),
      //         totalAmount:
      //           data.registration.amount_paid + data.registration.balance,
      //         paymentMethod:
      //           paymentMethod === "mobileMoney"
      //             ? "Mobile Money"
      //             : "Credit/Debit Card",
      //         transactionId: result.internalReference,
      //       }),
      //     });

      //     setPaymentStatus("idle");
      //     setPaymentLoading(false);
      //     setPaymentDetails((prev) => ({
      //       ...prev,
      //       providerTransactionId: statusResult.data.providerTransactionId,
      //       completedAt: statusResult.data.completedAt,
      //     }));

      //     setShowSuccessPopup(true);
      //     toast.success("Payment confirmed and saved!");
      //     router.refresh();
      //   } else if (statusResult.status === "failed") {
      //     clearInterval(interval);
      //     setPaymentStatus("failed");
      //     setPaymentLoading(false);
      //     toast.error("Payment failed Please try again");
      //   }
      // };

const pollStatus = async () => {
  if (!result.internalReference) return;

  // Get current time and calculate if 4 minutes have passed
  const currentTime = Date.now();
  const timeElapsed = (currentTime - startTime) / 1000; // Convert to seconds

  // If 4 minutes (240 seconds) have passed, stop polling and mark as failed
  if (timeElapsed >= 240) {
    clearInterval(interval);
    setPaymentStatus("failed");
    setPaymentLoading(false);
    toast.error("Payment timed out after 4 minutes. Please try again.");
    return;
  }

  // Otherwise, check payment status
  const statusResult = await checkPaymentStatus(result.internalReference);

  if (!statusResult.success) {
    throw new Error(statusResult.message);
  }

  if (statusResult.status === "success") {
    clearInterval(interval);

    // Save payment to DB
    await savePaymentToDB({
      userId: data.user.user_id,
      amount: Number(amount),
      transactionId: result.internalReference,
      registrationId: data.registration.id,
      phoneNumber: phoneNumber,
    });

    // Send confirmation email
    await fetch("/api/send-payment-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.user.email,
        fullName: data.user.fullName,
        amountPaid: Number(amount),
        balance: data.registration.balance - Number(amount),
        totalAmount: data.registration.amount_paid + data.registration.balance,
        paymentMethod: paymentMethod === "mobileMoney" ? "Mobile Money" : "Credit/Debit Card",
        transactionId: result.internalReference,
      }),
    });

    setPaymentStatus("idle");
    setPaymentLoading(false);
    setPaymentDetails((prev) => ({
      ...prev,
      providerTransactionId: statusResult.data.providerTransactionId,
      completedAt: statusResult.data.completedAt,
    }));

    setShowSuccessPopup(true);
    toast.success("Payment confirmed and saved!");
        setTimeout(() => {
        window.location.reload();
      }, 9000); 
  } else if (statusResult.status === "failed") {
    clearInterval(interval);
    setPaymentStatus("failed");
    setPaymentLoading(false);
    toast.error("Payment failed. Please try again.");
  }
};

      const interval = setInterval(pollStatus, 2000);
      setPollingInterval(interval);
      setTimeout(pollStatus, 2000);

      return () => clearInterval(interval);
    } catch (error) {
      setPaymentStatus("failed");
      setPaymentLoading(false);
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
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
      {/* Full-screen loading overlay - only shown during processing */}
      {paymentStatus === "processing" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-white">
              Processing payment...
            </p>
            <p className="text-gray-300 mt-2">
              Please approve the payment on your phone
            </p>
          </div>
        </div>
      )}

      {/* Success popup - shown as a modal instead of full-screen overlay */}
      {showSuccessPopup && paymentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg border">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h3>
            <div className="text-left space-y-2 mb-6">
              <p>
                <span className="font-medium">Amount:</span> UGX{" "}
                {paymentDetails.amount?.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Provider:</span>{" "}
                {paymentDetails.provider?.replace("_", " ")}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {paymentDetails.msisdn}
              </p>
              {paymentDetails.providerTransactionId && (
                <p>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {paymentDetails.providerTransactionId}
                </p>
              )}
            </div>
            <Button
              onClick={() => {
                setShowSuccessPopup(false);
                window.location.reload();
              }}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Failed notification */}
      {paymentStatus === "failed" && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg border">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-6">
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
                  (window.location.href = "mailto:alebarkm@gmail.com")
                }
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              {data.registration.registration_status === "registered"
                ? "REI25 Registration Details"
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
                    {data.user.accommodation && (
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Accommodation:
                        </Label>
                        <p>{data.user.accommodation}</p>
                      </div>
                    )}
                    {data.user.special_medical_conditions && (
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">
                          Special Medical Conditions:
                        </Label>
                        <p>{data.user.special_medical_conditions}</p>
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
                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">Status:</Label>
                        <p className={`font-medium ${data.registration.payment_status === "pending"
                          ? "text-orange-500"
                          : "text-green-500"
                          }`}>
                          {data.registration.payment_status.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">Amount Paid:</Label>
                        <p>UGX {data.registration.amount_paid.toLocaleString()}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">Total Amount:</Label>
                        <p>UGX {totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Label className="text-gray-500 text-sm">Balance:</Label>
                        <p className="font-medium">
                          UGX {data.registration.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {data.registration.balance > 0 ? (
                      <>
                        <div className="space-y-4">
                          {/* Mobile Money Payment Card */}
                          <div className={`p-4 border rounded-lg text-left transition-colors bg-white shadow-sm`}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-3">
                              <div className="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center bg-white flex-shrink-0">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              </div>

                              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="/mtn-logo.svg"
                                    alt="MTN"
                                    className="h-8 sm:h-10 object-contain"
                                  />
                                  <img
                                    src="/airtel-logo.png"
                                    alt="Airtel"
                                    className="h-9 sm:h-11 object-contain"
                                  />
                                </div>

                                <div className="xs:ml-2">
                                  <Label className="font-medium text-base sm:text-inherit">Mobile Money & Airtel Money</Label>
                                  <p className="text-sm text-gray-500 mt-0.5 sm:mt-0">
                                    Pay with MTN MoMo or Airtel Money
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Form */}
                          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div>
                              <Label>Telephone Number (Pay With MTN or Airtel UG)</Label>
                              <Input
                                type="tel"
                                placeholder="e.g. 785721293 or 775721293"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="mt-1 bg-white"
                              />
                            </div>
                            <div>
                              <Label>Amount (UGX)</Label>
                              <select
                                value={amount}
                                onChange={(e) => {
                                  const selectedAmount = e.target.value;
                                  setAmount(selectedAmount);
                                  const fee = selectedAmount ? Number(selectedAmount) * 0.03 : 0;
                                  setFeeAmount(fee);
                                  setTotalAmounts(selectedAmount ? Number(selectedAmount) + fee : 0);
                                }}
                                className="mt-1 bg-white font-medium w-full p-2 border rounded-md"
                              >
                                <option value="">Select an amount</option>
                               {/* <option value="500">500 UGX</option>  */}
                                <option value="100000">100,000 UGX</option>
                                <option value="80000">80,000 UGX</option>
                                <option value="140000">140,000 UGX</option>
                                <option value="380000">380,000 UGX</option>
                              </select>
                            </div>
                            {amount && (
                              <div className="space-y-2 pt-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Amount:</span>
                                  <span className="text-sm font-medium">
                                    {parseFloat(amount).toLocaleString()} UGX
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Fee (3%):</span>
                                  <span className="text-sm font-medium">
                                    {feeAmount.toLocaleString()} UGX
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="text-sm font-semibold">Total:</span>
                                  <span className="text-sm font-semibold">
                                    {totalAmounts.toLocaleString()} UGX
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={handlePayment}
                          className="w-full bg-gray-900 hover:bg-blue-700 py-6 text-lg"
                          disabled={paymentLoading || paymentStatus === "processing"}
                        >
                          {paymentLoading || paymentStatus === "processing" ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            "Pay Now"
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-lg font-medium text-gray-800">
                          Payment Complete
                        </p>
                        <p className="text-gray-600">
                          Thank you for your payment!
                        </p>
                      </div>
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
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
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

              <h3 className="text-xl font-bold text-gray-800">
                Credit/Debit Card Payments
              </h3>

              <p className="text-gray-600">
                Credit/Debit card payments are not yet available at the moment.
                Please contact us for assistance or try Mobile Money payment.
              </p>

              <button
                onClick={() => setShowCardPopup(false)}
                className="mt-4 w-full bg-gray-900 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Contact Customer Support
              </button>

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
    </>
  );
}
