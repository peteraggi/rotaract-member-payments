// app/api/reports/payments/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        user: {
          select: {
            user_id: true,
            fullName: true,
            email: true,
            club_name: true,
          },
        },
      },
    });

    const reports = registrations.map((reg) => ({
      user_id: reg.user.user_id,
      fullName: reg.user.fullName,
      email: reg.user.email,
      club_name: reg.user.club_name,
      amount_paid: reg.amount_paid,
      balance: reg.balance,
      payment_status: reg.payment_status,
    }));

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment reports' },
      { status: 500 }
    );
  }
}