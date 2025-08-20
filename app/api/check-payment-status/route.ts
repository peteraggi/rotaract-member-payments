import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const PROXY_API_ENDPOINT = process.env.PROXY_API_ENDPOINT || 'http://161.35.39.124:3001/api';

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
    // Forward the request to our proxy API
    const response = await fetch(
      `${PROXY_API_ENDPOINT}/check-payment-status?internal_reference=${encodeURIComponent(internalReference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'STATUS_CHECK_FAILED',
          message: result.message || 'Failed to check payment status',
          details: result
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

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