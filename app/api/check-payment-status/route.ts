// app/api/check-payment-status/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const RELWORX_API_ENDPOINT = 'https://payments.relworx.com/api/mobile-money';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const internalReference = searchParams.get('internal_reference');
  
  const headersList = headers();
  const authToken = headersList.get('Authorization')?.replace('Bearer ', '');

  if (!authToken) {
    return NextResponse.json({ 
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required' 
    }, { status: 401 });
  }

  if (!internalReference) {
    return NextResponse.json(
      { 
        success: false,
        error: 'MISSING_REFERENCE',
        message: 'Internal reference is required'
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${RELWORX_API_ENDPOINT}/check-request-status?internal_reference=${internalReference}&account_no=${process.env.RELWORX_ACCOUNT_NO}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.relworx.v2',
          'Authorization': `Bearer ${process.env.RELWORX_API_KEY}`
        }
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error_code || 'STATUS_CHECK_FAILED',
          message: result.message || 'Failed to check payment status',
          details: result
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.request_status, // "pending", "success", or "failed"
      message: result.message,
      data: {
        customerReference: result.customer_reference,
        internalReference: result.internal_reference,
        msisdn: result.msisdn,
        amount: result.amount,
        currency: result.currency,
        provider: result.provider,
        charge: result.charge,
        providerTransactionId: result.provider_transaction_id,
        completedAt: result.completed_at
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to check payment status'
      },
      { status: 500 }
    );
  }
}