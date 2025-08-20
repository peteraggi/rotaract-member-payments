import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PROXY_API_ENDPOINT = process.env.PROXY_API_ENDPOINT || 'http://161.35.39.124:3001/api';

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
    const { amount, phoneNumber } = await req.json();
    
    // Validate input
    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { 
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Amount and phone number are required'
        },
        { status: 400 }
      );
    }

    // Forward the request to our proxy API
    const response = await fetch(`${PROXY_API_ENDPOINT}/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ amount, phoneNumber })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'PAYMENT_FAILED',
          message: result.message || 'Payment request failed',
          details: result
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}