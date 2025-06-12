"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function DCAPaymentPage() {
  // Dummy data
  const member = {
    name: "Aggi Peter",
    telephone: "0778089708",
    club: "Bugolobi (ROTARY)",
    paid: 0,
    total: 180000,
    status: "PENDING",
  };

  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobileMoney">(
    "mobileMoney"
  );
  const [phoneNumber, setPhoneNumber] = useState(
    "256" + member.telephone.slice(1)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const exchangeRate = 3800; // Example exchange rate: 1 USD = 3800 UGX

  const handlePayment = () => {
    setLoading(true);
    setError(null);

    // Simulate payment processing
    setTimeout(() => {
      try {
        // In a real app, this would process the payment
        console.log(`Processing ${paymentMethod} payment for ${member.name}`);
        console.log(
          `Amount: $${member.total} (${member.total * exchangeRate} UGX)`
        );

        // Simulate success
        window.location.href = "/confirmation"; // Redirect to confirmation page
      } catch (err) {
        setError("Payment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Payment Details
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Member Details - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-medium">
                    Registration Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">Full Name:</Label>
                    <p className="font-medium">{member.name}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">Telephone:</Label>
                    <p>{member.telephone}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">Club Name:</Label>
                    <p>{member.club}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">
                      Amount Paid:
                    </Label>
                    <p>
                      UGX {member.paid} of UGX {member.total}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">Balance:</Label>
                    <p className="font-medium">
                      UGX {member.total - member.paid}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Label className="text-gray-500 text-sm">Status:</Label>
                    <p
                      className={`font-medium ${
                        member.status === "PENDING"
                          ? "text-orange-500"
                          : "text-green-500"
                      }`}
                    >
                      {member.status}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section - Takes 3 columns */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm border">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-medium">
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
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

                      <button
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
                            <Label className="font-medium">Mobile Money</Label>
                            <p className="text-sm text-gray-500">
                              🇺🇬 Pay with MTN/Airtel Uganda
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === "mobileMoney" && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                          <Label className="text-gray-700">
                            Telephone Number (MTN/Airtel UG)
                          </Label>
                          <Input
                            type="tel"
                            placeholder="e.g. 256777000999"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Amount in (UGX)</Label>
                          <Input
                            type="text"
                            value={member.total}
                            readOnly
                            className="mt-1 bg-white font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                          <Label className="text-gray-700">Card Number</Label>
                          <Input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            className="mt-1 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700">Expiry Date</Label>
                            <Input
                              type="text"
                              placeholder="MM/YY"
                              className="mt-1 bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700">CVV</Label>
                            <Input
                              type="text"
                              placeholder="123"
                              className="mt-1 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700">
                            Amount in (UGX)
                          </Label>
                          <Input
                            type="text"
                            value={member.total}
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
                    disabled={loading}
                  >
                    {loading ? "Processing..." : `Pay UGX ${member.total}`}
                  </Button>

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
  );
}
