// app/api/save-payment/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { safeBigIntToJSON } from '@/lib/bou-utils';

// Helper to generate BOU reference number with daily reset counter
async function generateBouReference() {
  const now = new Date();
  const today = new Date(now.toISOString().split('T')[0]); // Get date without time
  
  const counterRecord = await prisma.dailyTransactionCounter.upsert({
    where: { date: today },
    create: { date: today, counter: 1 },
    update: { counter: { increment: 1 } }
  });

  // Format date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Generate reference number format: BOU + YYYYMMDD + HHMMSS + 6-digit daily sequence
  return `BOU${year}${month}${day}${hours}${minutes}${seconds}${String(counterRecord.counter).padStart(6, '0')}`;
}

export async function POST(req: Request) {
  const headersList = headers();
  const authToken = headersList.get('Authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ 
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    }, { status: 401 });
  }

  try {
    const { 
      userId, 
      amount, 
      transactionId, 
      paymentMethod, 
      registrationId,
      phoneNumber 
    } = await req.json();
    
    // Validate required fields
    if (!userId || !amount || !transactionId || !paymentMethod || !registrationId || !phoneNumber) {
      return NextResponse.json(
        { 
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Generate BOU fields
    const bouReference = await generateBouReference();
    const transactionDatetime = new Date();
    const transferValue = Math.round(amount);

    // 1. Create the payment record with BOU fields
    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        registration_id: registrationId,
        phone_number: phoneNumber,
        status: "completed",
        
        // BOU Fields
        reference_number: bouReference,
        entry_type: "C",
        purpose_code: 909,
        transaction_datetime: transactionDatetime,
        initiator_account_id: phoneNumber,
        second_party_account_id: process.env.RELWORX_ACCOUNT_NO || "DEFAULT_ACCOUNT",
        transfer_value: transferValue,
        emoney_issuer_code: "618",
        message_category: "01",
        off_network: 1,
        initiator_access_type: "703",
        initiator_country_code: "800",
        second_party_country_code: "800",
        transfer_description: "Rotaract Registration Payment"
      }
    });

    // 2. Update the registration record
    const registration = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        amount_paid: { increment: amount },
        balance: { decrement: amount },
        payment_status: await getUpdatedPaymentStatus(registrationId),
        updated_at: new Date()
      },
      include: { 
        payments: true,
        user: true 
      }
    });

    return NextResponse.json(safeBigIntToJSON({ 
      success: true,
      payment,
      registration,
      bouReference
    }));
    
  } catch (error) {
    console.error('Save payment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to save payment',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to determine payment status
async function getUpdatedPaymentStatus(registrationId: number): Promise<string> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payments: true }
  });

  if (!registration) return 'pending';
  
  const totalPaid = registration.payments.reduce((sum, payment) => {
    return sum + (payment.amount || 0);
  }, 0);

  const totalAmount = totalPaid + (registration.balance || 0);
  
  if (totalPaid >= totalAmount) return 'fully_paid';
  if (totalPaid > 0) return 'partially_paid';
  return 'pending';
}