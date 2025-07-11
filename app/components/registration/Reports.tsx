// app/reports/page.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentReport {
  user_id: number;
  fullName: string;
  email: string;
  club_name: string;
  amount_paid: number;
  balance: number;
  payment_status: string;
}

export default function ReportsPage({ session }: { session: any }) {
  const router = useRouter();
  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '80000' | '100000' | 'fully'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Admin check
  const isAdmin = session?.user?.email === 'aggi@scintl.co.ug' || session?.user?.isAdmin;

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }

    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports/payments');
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        toast.error('Error loading reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAdmin, router]);

  useEffect(() => {
    let filtered = [...reports];
    switch (filter) {
      case '80000':
        filtered = reports.filter(report => report.amount_paid === 80000);
        break;
      case '100000':
        filtered = reports.filter(report => report.amount_paid === 100000);
        break;
      case 'fully':
        filtered = reports.filter(report => report.balance === 0);
        break;
      default:
        filtered = reports;
    }
    setFilteredReports(filtered);
    setCurrentPage(1); 
  }, [filter, reports]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!isAdmin) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reports: filteredReports }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rotaract-payments-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    try {
      const logoUrl = '/logo.png';
      const logoResponse = await fetch(logoUrl);
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });
      
      const imgWidth = 60;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = (pageWidth - imgWidth) / 2;
      
      doc.addImage(logoDataUrl as string, 'PNG', centerX, 15, imgWidth, imgWidth * 0.5);
    } catch (error) {
      console.error('Error loading logo:', error);
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('Rotaract Club', 105, 30, { align: 'center' });
    }
    
    // Add report title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Report', 105, 55, { align: 'center' });
    
    // Add filter info and date
    doc.setFontSize(10);
    let filterText = 'All Payments';
    if (filter === '80000') filterText = 'Payments of UGX 80,000';
    if (filter === '100000') filterText = 'Payments of UGX 100,000';
    if (filter === 'fully') filterText = 'Fully Paid Members (UGX 180,000)';
    
    doc.text(`Filter: ${filterText}`, 20, 55);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 20, 60);
    doc.text(`Page 1 of ${Math.ceil(filteredReports.length / 25)}`, 160, 60);
    
    // Prepare data for the table (limit to 25 rows per page for A4 portrait)
    const headers = ['Member', 'Email', 'Club', 'Amount Paid', 'Balance', 'Status'];
    const tableData = filteredReports.map(report => [
      report.fullName,
      report.email,
      report.club_name || 'N/A',
      `UGX ${report.amount_paid.toLocaleString()}`,
      `UGX ${report.balance.toLocaleString()}`,
      report.balance === 0 ? 'Fully Paid' : report.amount_paid > 0 ? 'Partially Paid' : 'Unpaid'
    ]);
    
    // Add table using autoTable with clean styling
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 65,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [200, 200, 200]
      },
      bodyStyles: {
        lineWidth: 0.3,
        lineColor: [240, 240, 240]
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      margin: { horizontal: 10 },
      tableWidth: 'auto',
      theme: 'grid',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      tableLineWidth: 0.1,
      showHead: 'everyPage'
    });
    
    // Save the PDF
    doc.save(`rotaract-payments-${filter}-${date}.pdf`);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Payment Reports</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handlePrint} 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm bg-white hover:bg-gray-50 border-gray-200"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Print
          </Button>
          <Button 
            onClick={handleExport} 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm bg-white hover:bg-gray-50 border-gray-200"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={generatePDF} 
            variant="outline" 
            size="sm" 
            className="text-xs sm:text-sm bg-white hover:bg-gray-50 border-gray-200"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 sm:gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          All Payments
        </Button>
        <Button 
          variant={filter === '80000' ? 'default' : 'outline'} 
          onClick={() => setFilter('80000')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          UGX 80K
        </Button>
        <Button 
          variant={filter === '100000' ? 'default' : 'outline'} 
          onClick={() => setFilter('100000')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          UGX 100K
        </Button>
        <Button 
          variant={filter === 'fully' ? 'default' : 'outline'} 
          onClick={() => setFilter('fully')}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Fully Paid
        </Button>
      </div>

      <Card className="overflow-hidden border-gray-200">
        <CardHeader className="p-3 sm:p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            Member Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Email
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((report) => (
                      <tr key={report.user_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{report.fullName}</div>
                          <div className="text-gray-500 sm:hidden text-xs">{report.email}</div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                          {report.email}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-gray-500">
                          {report.club_name || 'N/A'}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          UGX {report.amount_paid.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          UGX {report.balance.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${
                              report.balance === 0
                                ? 'bg-green-50 text-green-700'
                                : report.amount_paid > 0
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {report.balance === 0
                              ? 'Paid'
                              : report.amount_paid > 0
                              ? 'Partial'
                              : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastRecord, filteredReports.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredReports.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === number
                              ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}