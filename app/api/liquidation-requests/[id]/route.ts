// app/api/liquidation-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    const { id } = params;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' }, 
        { status: 400 }
      );
    }

    const request = await prisma.liquidationRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error updating request:', error);
    
    // Handle specific errors
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Request not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}