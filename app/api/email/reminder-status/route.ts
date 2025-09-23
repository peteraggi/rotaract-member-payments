// app/api/email/reminder-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ADMINS } from '@/lib/bou-utils';
import { getAllReminderStatuses } from '@/lib/reminder-log';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is admin
    const isAdmin = ADMINS.some(admin => admin.email === session?.user?.email) || session?.user?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const statuses = await getAllReminderStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching reminder statuses:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}