// app/api/reports/export/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reports } = await request.json();
    
    // Convert reports to CSV format
    const headers = ['Name', 'Email', 'Club', 'Amount Paid', 'Balance', 'Status'];
    const csvRows = [
      headers.join(','),
      ...reports.map((report: any) => 
        [
          `"${report.fullName}"`,
          report.email,
          `"${report.club_name || ''}"`,
          report.amount_paid,
          report.balance,
          report.balance === 0 ? 'Fully Paid' : report.amount_paid > 0 ? 'Partially Paid' : 'Unpaid'
        ].join(',')
      ),
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=rotaract-payments-report.csv',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}