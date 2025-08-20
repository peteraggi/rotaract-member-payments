// app/api/liquidation-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.liquidationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// app/api/liquidation-requests/[id]/route.ts
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

    const request = await prisma.liquidationRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}