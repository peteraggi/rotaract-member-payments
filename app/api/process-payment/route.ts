// app/api/process-payment/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const RELWORX_API_ENDPOINT = 'https://payments.relworx.com/api/mobile-money';

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

    // First validate the mobile number
    const validationResponse = await validateMobileNumber(phoneNumber);
    if (!validationResponse.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'INVALID_NUMBER',
          message: `Invalid mobile number: ${validationResponse.message || 'Validation failed'}`,
          details: validationResponse
        },
        { status: 400 }
      );
    }

    // Request payment
    const paymentResponse = await requestPayment({
      phoneNumber,
      amount,
      description: 'Conference registration payment'
    });

    if (!paymentResponse.success) {
      return NextResponse.json(
        { 
          success: false,
          error: paymentResponse.error_code || 'PAYMENT_FAILED',
          message: paymentResponse.message || 'Payment request failed',
          details: paymentResponse
        },
        { status: 400 }
      );
    }

    // Return the references to track payment status
    return NextResponse.json({
      success: true,
      status: 'PENDING',
      customerReference: paymentResponse.customer_reference,
      internalReference: paymentResponse.internal_reference,
      message: 'Payment request initiated. Please approve on your phone.',
      provider: paymentResponse.provider,
      amount: paymentResponse.amount
    });

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

async function validateMobileNumber(phoneNumber: string) {
  try {
    const response = await fetch(`${RELWORX_API_ENDPOINT}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.relworx.v2',
        'Authorization': `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify({
        msisdn: `+${phoneNumber}`
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Validation failed',
        ...result
      };
    }

    return {
      success: true,
      valid: result.valid,
      network: result.network,
      message: result.message,
      ...result
    };

  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      message: 'Error during validation'
    };
  }
}

async function requestPayment(params: {
  phoneNumber: string;
  amount: number;
  description: string;
}) {
  try {
    const response = await fetch(`${RELWORX_API_ENDPOINT}/request-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.relworx.v2',
        'Authorization': `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify({
        account_no: process.env.RELWORX_ACCOUNT_NO,
        msisdn: `+${params.phoneNumber}`,
        amount: params.amount,
        currency: 'UGX',
        description: params.description,
        reference: `REI-${Date.now()}` // Unique reference for each transaction
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Payment request failed',
        ...result
      };
    }

    return {
      success: true,
      ...result
    };

  } catch (error) {
    console.error('Payment request error:', error);
    return {
      success: false,
      message: 'Error during payment request'
    };
  }
}