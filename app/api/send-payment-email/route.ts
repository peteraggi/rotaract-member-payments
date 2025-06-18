// app/api/send-payment-confirmation/route.ts
import { sendPaymentConfirmationEmail } from "@/lib/payment-email";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.email || !body.fullName || !body.transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendPaymentConfirmationEmail(
      body.email,
      body.fullName,
      body.amountPaid,
      body.balance,
      body.totalAmount,
      body.paymentMethod,
      body.transactionId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in payment confirmation route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send payment confirmation" },
      { status: 500 }
    );
  }
}