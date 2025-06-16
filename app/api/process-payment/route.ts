// app/api/process-payment/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const RELWORX_API_ENDPOINT = 'https://payments.relworx.com/api/mobile-money';

export async function POST(req: Request) {
  const headersList = headers();
  const authToken = headersList.get('Authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, phoneNumber } = await req.json();
    
    // Validate input
    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    // First validate the mobile number
    const validationResponse = await validateMobileNumber(phoneNumber);
    if (!validationResponse.success) {
      return NextResponse.json(
        { error: 'Invalid mobile number: ' + (validationResponse.message || 'Validation failed') },
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
          error: paymentResponse.message || 'Payment request failed',
          details: paymentResponse
        },
        { status: 400 }
      );
    }

    // Return the references to track payment status
    return NextResponse.json({
      success: true,
      customerReference: paymentResponse.customer_reference,
      internalReference: paymentResponse.internal_reference,
      message: 'Payment request initiated. Please approve on your phone.',
      provider: paymentResponse.provider,
      amount: paymentResponse.amount
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while processing payment' },
      { status: 500 }
    );
  }
}

// Validate mobile number format and network
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
    console.log('Validation response:', result);

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Validation failed'
      };
    }

    return {
      success: true,
      valid: result.valid,
      network: result.network,
      message: result.message
    };

  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      message: 'Error during validation'
    };
  }
}

// Request payment from mobile money
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
        description: 'Conference registration payment',
        reference: `REI-${Date.now()}` // Unique reference for each transaction
      })
    });

    const result = await response.json();
    console.log('Payment response:', result);

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

// Check payment status
export async function checkPaymentStatus(internalReference: string) {
  try {
    const response = await fetch(`${RELWORX_API_ENDPOINT}/check-request-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.relworx.v2',
        'Authorization': `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify({
        account_no: process.env.RELWORX_ACCOUNT_NO,
        internal_reference: internalReference
      })
    });

    const result = await response.json();
    console.log('Status check response:', result);

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Status check failed',
        ...result
      };
    }

    return {
      success: true,
      status: result.request_status,
      ...result
    };

  } catch (error) {
    console.error('Status check error:', error);
    return {
      success: false,
      message: 'Error during status check'
    };
  }
}