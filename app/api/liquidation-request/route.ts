// app/api/liquidation-request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const {
      amount,
      paymentMethod,
      accountName,
      bankName,
      accountNumber,
      mobileNumber,
      network,
      reason,
      disbursementDate,
    } = body;

    // Validate required fields
    if (!amount || !paymentMethod || !accountName || !reason || !disbursementDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the liquidation request
    const request = await prisma.liquidationRequest.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod,
        accountName,
        bankName: bankName || null, 
        accountNumber: accountNumber || null,
        mobileNumber: mobileNumber || null,
        network: network || null,
        reason,
        disbursementDate: new Date(disbursementDate),
        status: 'pending',
        requesterId: String(session.user.user_id),
        requesterName: session.user.name ?? session.user.email ?? '', 
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Error creating liquidation request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}