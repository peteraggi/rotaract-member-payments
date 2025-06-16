import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registration = await prisma.registration.findFirst({
      where: { user: { email: session.user.email } },
      include: { user: true }
    });

    return NextResponse.json({ 
      isRegistered: !!registration,
      registration,
      user: registration?.user
    });
    
  } catch (error) {
    console.error('Registration check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}