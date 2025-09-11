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
            gender: true,
            country: true,
            district: true,
            designation: true,
            t_shirt_size: true,
            dietary_needs: true,
            special_medical_conditions: true,
            accommodation: true,
            phone_number: true
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
      gender: reg.user.gender,
      country: reg.user.country,
      district: reg.user.district,
      designation: reg.user.designation,
      t_shirt_size: reg.user.t_shirt_size,
      dietary_needs: reg.user.dietary_needs,
      special_medical_conditions: reg.user.special_medical_conditions,
      accommodation: reg.user.accommodation,
      registration_status: reg.registration_status,
      phone_number: reg.user.phone_number,

      
    })); 

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment reports' },
      { status: 500 }
    );
  }
}