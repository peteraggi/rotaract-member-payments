import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Registration data:', data);
    
    // Update user with all the new information
    const user = await prisma.user.update({
      where: { email: session.user.email ?? (() => { throw new Error('Email is null or undefined'); })() },
      data: {
        fullName: data.fullName,
        phone_number: data.phoneNumber,
        gender: data.gender,
        club_name: data.clubName,
        country: data.country,
        district: data.district,
        designation: data.designation,
        t_shirt_size: data.shirtSize,
        dietary_needs: data.dietaryRestrictions,
        accommodation: data.accommodation,
      },
    });

    // Create a new registration record
    const registration = await prisma.registration.create({
      data: {
        user_id: user.user_id,
        registration_status: 'registered',
        amount_paid: 0,
        balance: 180000,
        payment_status: 'pending',
      },
    });

    return NextResponse.json({ 
      success: true,
      user,
      registration 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}