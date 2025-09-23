// app/api/email/send-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ADMINS } from '@/lib/bou-utils';
import { canSendReminder, createOrUpdateReminderLog } from '@/lib/reminder-log';
import { sendPaymentReminderEmail } from '@/lib/reminder-email';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is admin
    const isAdmin = ADMINS.some(admin => admin.email === session?.user?.email) || session?.user?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Check if reminder can be sent (7-day cooldown)
    const reminderCheck = await canSendReminder(userId);
    
    if (!reminderCheck.canSend) {
      return NextResponse.json({ 
        message: `Reminder can only be sent once per week. Please try again in ${reminderCheck.daysUntilNext} days.`,
        nextAvailable: new Date(Date.now() + (reminderCheck.daysUntilNext * 24 * 60 * 60 * 1000)).toISOString(),
        lastSent: reminderCheck.lastSent?.toISOString()
      }, { status: 429 });
    }

    // Fetch user details from your reports API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const usersResponse = await fetch(`${baseUrl}/api/reports/payments`);
    
    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await usersResponse.json();
    const user = users.find((u: any) => u.user_id === parseInt(userId));
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has already paid
    if (user.balance === 0) {
      return NextResponse.json({ message: 'User has already completed payment' }, { status: 400 });
    }

    // Send reminder email
    await sendPaymentReminderEmail(
      user.email,
      user.fullName,
      user.amount_paid,
      user.balance
    );

    // Update reminder log in database
    await createOrUpdateReminderLog(parseInt(userId));

    // Log the activity
    // console.log(`Payment reminder sent to ${user.email} by ${session.user?.email} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      message: 'Reminder sent successfully',
      user: {
        name: user.fullName,
        email: user.email,
        amountPaid: user.amount_paid,
        balanceDue: user.balance
      },
      nextReminderAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    
    if (error.code === 'EAUTH') {
      return NextResponse.json({ 
        message: 'Email authentication failed. Please check your email configuration.' 
      }, { status: 500 });
    }
    
    if (error.code === 'EENVELOPE') {
      return NextResponse.json({ 
        message: 'Invalid email address or email sending failed.' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}