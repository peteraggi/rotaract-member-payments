// app/api/save-payment/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const headersList = headers();
  const authToken = headersList.get('Authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, amount, transactionId, paymentMethod, registrationId } = await req.json();
    
    // 1. Create the payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        registration_id: registrationId
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
      include: { payments: true }
    });

    return NextResponse.json({ 
      success: true,
      payment,
      registration
    });
    
  } catch (error) {
    console.error('Save payment error:', error);
    return NextResponse.json(
      { error: 'Failed to save payment' },
      { status: 500 }
    );
  }
}

// Helper function to determine payment status
async function getUpdatedPaymentStatus(registrationId: number) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payments: true }
  });

  if (!registration) return 'pending';
  
  const totalPaid = registration.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalAmount = totalPaid + registration.balance; // Original total amount
  
  if (totalPaid >= totalAmount) return 'fully_paid';
  if (totalPaid > 0) return 'partially_paid';
  return 'pending';
}