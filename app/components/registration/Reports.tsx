// app/components/registration/Reports.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Printer, Download, ChevronLeft, ChevronRight,
  Users, DollarSign, CheckCircle, XCircle, Filter,
  ChevronDown, Circle, CheckCircle2, Clock,
  Bed,
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ADMINS } from '@/lib/bou-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmationModal from '../email/ConfirmationModal';

interface PaymentReport {
  user_id: number;
  fullName: string;
  email: string;
  club_name: string;
  amount_paid: number;
  gender: string;
  balance: number;
  designation: string;
  t_shirt_size: string;
  dietary_needs: string;
  special_medical_conditions: string;
  accommodation: string;
  registration_status: string;
  phone_number: string;
  district: string;
  country: string;
  payment_status: string;
}

// interface for reminder tracking
interface ReminderStatus {
  userId: number;
  lastSent: string | null;
  canSend: boolean;
  daysUntilNext: number;
}

export default function ReportsPage({ session }: { session: any }) {
  const router = useRouter();
  const [reports, setReports] = useState<PaymentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '100000' | '300000' | 'fully'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [accommodationFilter, setAccommodationFilter] = useState<'all' | 'shared' | 'not_shared'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [reminderStatuses, setReminderStatuses] = useState<ReminderStatus[]>([]);
  const [sendingReminders, setSendingReminders] = useState<{ [key: number]: boolean }>({});


  // Admin check
  const isAdmin = ADMINS.some(admin => admin.email === session?.user?.email) || session?.user?.isAdmin;

  // Calculate summary statistics
  const totalMembers = reports.length;
  const totalFullyPaid = reports.filter(report => report.balance === 0).length;
  const totalPartiallyPaid = reports.filter(report => report.amount_paid > 0 && report.balance > 0).length;
  const totalUnpaid = reports.filter(report => report.amount_paid === 0).length;
  const totalMoneyPaid = reports.reduce((sum, report) => sum + report.amount_paid, 0);
  const totalMale = reports.filter(report => report.gender?.toLowerCase() === 'male').length;
  const totalFemale = reports.filter(report => report.gender?.toLowerCase() === 'female').length;
  const totalSharedAccommodation = reports.filter(report =>
    report.accommodation?.toLowerCase().includes('shared') ||
    report.accommodation?.toLowerCase().includes('yes')
  ).length;
  const totalNotSharedAccommodation = reports.filter(report =>
    report.accommodation?.toLowerCase().includes('not') ||
    report.accommodation?.toLowerCase().includes('no') ||
    report.accommodation?.toLowerCase().includes('private')
  ).length;
  
  // Get unique districts for filter
  const uniqueDistricts = Array.from(new Set(reports.map(report => report.district).filter(Boolean))).sort();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PaymentReport | null>(null);


  // Additional statistics for new cards
  const totalExpectedRevenue = totalMembers * 380000;
  const totalPendingRevenue = totalExpectedRevenue - totalMoneyPaid;
  const averagePaymentPerMember = totalMembers > 0 ? totalMoneyPaid / totalMembers : 0;


  // effect to load reminder statuses
  useEffect(() => {
    const loadReminderStatuses = async () => {
      try {
        const response = await fetch('/api/email/reminder-status');
        if (response.ok) {
          const statuses = await response.json();
          setReminderStatuses(statuses);
        } else {
          console.error('Failed to load reminder statuses:', response.status);
          // Initialize with empty array if API fails
          setReminderStatuses([]);
        }
      } catch (error) {
        console.error('Error loading reminder statuses:', error);
        setReminderStatuses([]);
      }
    };

    if (isAdmin) {
      loadReminderStatuses();
    }
  }, [isAdmin]);


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

    // Apply amount filter
    switch (filter) {
      case '100000':
        filtered = filtered.filter(report => report.amount_paid === 100000);
        break;
      case '300000':
        filtered = filtered.filter(report => report.amount_paid === 300000);
        break;
      case 'fully':
        filtered = filtered.filter(report => report.balance === 0);
        break;
      default:
        // No filter change
        break;
    }

    // Apply gender filter
    switch (genderFilter) {
      case 'male':
        filtered = filtered.filter(report => report.gender?.toLowerCase() === 'male');
        break;
      case 'female':
        filtered = filtered.filter(report => report.gender?.toLowerCase() === 'female');
        break;
      default:
        // No filter change
        break;
    }

    // Apply accommodation filter
    switch (accommodationFilter) {
      case 'shared':
        filtered = filtered.filter(report =>
          report.accommodation?.toLowerCase().includes('shared') ||
          report.accommodation?.toLowerCase().includes('yes')
        );
        break;
      case 'not_shared':
        filtered = filtered.filter(report =>
          report.accommodation?.toLowerCase().includes('not') ||
          report.accommodation?.toLowerCase().includes('no') ||
          report.accommodation?.toLowerCase().includes('private')
        );
        break;
      default:
        // No filter change
        break;
    }

    // Apply payment status filter
    switch (paymentFilter) {
      case 'paid':
        filtered = filtered.filter(report => report.balance === 0);
        break;
      case 'partial':
        filtered = filtered.filter(report => report.amount_paid > 0 && report.balance > 0);
        break;
      case 'unpaid':
        filtered = filtered.filter(report => report.amount_paid === 0);
        break;
      default:
        // No filter change
        break;
    }

    // Apply district filter
    if (districtFilter !== 'all') {
      filtered = filtered.filter(report => report.district === districtFilter);
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [filter, genderFilter, accommodationFilter, paymentFilter, districtFilter, reports]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Improved pagination logic with dots
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 7; // Show max 7 page numbers including dots
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      if (currentPage <= 4) {
        // Near the beginning: show first 5 pages, then dots, then last page
        for (let i = 2; i <= 5; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end: show first page, dots, then last 5 pages
        items.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        // In the middle: show first page, dots, current-1, current, current+1, dots, last page
        items.push('ellipsis');
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

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

  // A function to handle sending individual reminders
  const handleOpenReminderModal = (user: PaymentReport) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (!selectedUser) return;

    setSendingReminders(prev => ({ ...prev, [selectedUser.user_id]: true }));

    try {
      const response = await fetch('/api/email/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUser.user_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle 429 (too many requests) specifically
        if (response.status === 429) {
          // Refresh the reminder statuses to get updated cooldown info
          const statusResponse = await fetch('/api/email/reminder-status');
          if (statusResponse.ok) {
            const updatedStatuses = await statusResponse.json();
            setReminderStatuses(updatedStatuses);
          }

          throw new Error(errorData.message);
        }

        throw new Error(errorData.message || 'Failed to send reminder');
      }

      const result = await response.json();

      // Refresh the reminder statuses after successful send
      const statusResponse = await fetch('/api/email/reminder-status');
      if (statusResponse.ok) {
        const updatedStatuses = await statusResponse.json();
        setReminderStatuses(updatedStatuses);
      }

      toast.success(`Reminder sent to ${selectedUser.fullName}`);
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to send reminder to ${selectedUser.fullName}`);
    } finally {
      setSendingReminders(prev => ({ ...prev, [selectedUser.user_id]: false }));
    }
  };


  const handleCloseModal = () => {
    if (!sendingReminders[selectedUser?.user_id || 0]) {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Helper function to get reminder status for a user
  const getReminderStatus = (userId: number) => {
    return reminderStatuses.find(status => status.userId === userId) || {
      userId,
      lastSent: null,
      canSend: true,
      daysUntilNext: 0
    };
  };

  // Helper function to check if reminder can be sent
  const canSendReminder = (user: PaymentReport) => {
    if (user.balance === 0) return false; // Fully paid members
    const status = getReminderStatus(user.user_id);
    return status.canSend;
  };

  // Helper function to get reminder button text and tooltip
  const getReminderButtonInfo = (user: PaymentReport) => {
    if (user.balance === 0) {
      return { text: 'Paid', tooltip: 'Member has completed payment', disabled: true };
    }

    const status = getReminderStatus(user.user_id);

    if (!status.canSend && status.lastSent) {
      const lastSentDate = new Date(status.lastSent);
      const nextAvailable = new Date(lastSentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const daysLeft = status.daysUntilNext;

      return {
        text: `Wait ${daysLeft}d`,
        tooltip: `Reminder sent on ${lastSentDate.toLocaleDateString()}. Can send again in ${daysLeft} days.`,
        disabled: true
      };
    }

    return {
      text: sendingReminders[user.user_id] ? 'Sending...' : 'Send Reminder',
      tooltip: 'Send payment reminder email',
      disabled: false
    };
  };


  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // A4 Landscape dimensions: 297mm (width) x 210mm (height)
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const tableWidth = pageWidth - (margin * 2);

    // Centered logo with your exact specifications
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
      const leftX = margin; // Positioned at left margin
      doc.addImage(logoDataUrl as string, 'PNG', leftX, 15, imgWidth, imgWidth * 0.5);
    } catch (error) {
      console.error('Error loading logo:', error);
      doc.setFontSize(20);
      doc.text('Rotaract Club', pageWidth / 2, 30, { align: 'center' });
    }

    // Report title and metadata below logo
    doc.setFontSize(18);
    doc.text('Payment Report', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(10);
    let filterText = 'All Payments';
    if (filter === '100000') filterText = 'Payments of UGX 100,000';
    if (filter === '300000') filterText = 'Payments of UGX 300,000';
    if (filter === 'fully') filterText = 'Fully Paid Members (UGX 380,000)';

    const date = new Date().toLocaleDateString();
    doc.text(`${filterText} | Generated: ${date}`, pageWidth / 2, 45, { align: 'center' });

    // Optimized column widths for maximum space utilization
    const columnStyles = {
      0: { cellWidth: 30 }, // Name
      1: { cellWidth: 25 }, // Club
      2: { cellWidth: 20 }, // Amount
      3: { cellWidth: 20 }, // Balance
      4: { cellWidth: 15 }, // T-Shirt
      5: { cellWidth: 25 }, // Dietary
      6: { cellWidth: 25 }, // District
      7: { cellWidth: 15 }, // Gender
      8: { cellWidth: 20 }, // Medical
      9: { cellWidth: 20 }, // Status
      10: { cellWidth: 25 } // Phone
    };

    // Full headers with proper spacing
    const headers = [
      [
        'Member Name',
        'Club',
        'Amount Paid',
        'Balance',
        'T-Shirt',
        'Dietary Needs',
        'District',
        'Gender',
        'Medical Cond.',
        'Phone',
        'Accommodation',
        'Status'
      ]
    ];

    // Format data with proper spacing
    const tableData = filteredReports.map(report => [
      report.fullName,
      report.club_name || '-',
      `UGX ${report.amount_paid.toLocaleString()}`,
      `UGX ${report.balance.toLocaleString()}`,
      report.t_shirt_size || '-',
      report.dietary_needs || 'Standard',
      report.district || '-',
      report.gender || '-',
      report.special_medical_conditions ? 'Yes' : 'No',
      report.phone_number || '-',
      report.accommodation || 'N/A',
      report.balance === 0 ? 'Fully Paid' : report.amount_paid > 0 ? 'Partial' : 'Unpaid'
    ]);

    // Main table with full-width styling
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 50, // Below header content
      margin: {
        left: margin,
        right: margin
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
        minCellHeight: 6
      },
      columnStyles: columnStyles,
      headStyles: {
        fillColor: [0, 100, 0], // Dark blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
        halign: 'center'
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [230, 230, 230]
      },
      alternateRowStyles: {
        fillColor: [242, 242, 242]
      },
      tableWidth: 'auto',
      theme: 'grid',
      pageBreak: 'auto',
      showHead: 'everyPage'
    });

    // Footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        200, // Bottom of landscape page
        { align: 'right' }
      );
    }

    doc.save(`rotaract-payments-${filter}-${date}.pdf`);
  };

  // Helper function to get filter display text
  const getFilterDisplayText = (type: string, value: string) => {
    switch (type) {
      case 'amount':
        switch (value) {
          case 'all': return 'All Payments';
          case '100000': return 'UGX 100K';
          case '140000': return 'UGX 140K';
          case 'fully': return 'Fully Paid';
          default: return 'All Payments';
        }
      case 'gender':
        switch (value) {
          case 'all': return 'All Genders';
          case 'male': return 'Male';
          case 'female': return 'Female';
          default: return 'All Genders';
        }
      case 'accommodation':
        switch (value) {
          case 'all': return 'All Types';
          case 'shared': return 'Shared';
          case 'not_shared': return 'Not Shared';
          default: return 'All Types';
        }
      case 'payment':
        switch (value) {
          case 'all': return 'All Statuses';
          case 'paid': return 'Fully Paid';
          case 'partial': return 'Partially Paid';
          case 'unpaid': return 'Unpaid';
          default: return 'All Statuses';
        }
      case 'district':
        return value === 'all' ? 'All Districts' : value;
      default:
        return '';
    }
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

      {/* Summary Cards - 6 cards arranged in 3 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Members */}
        <Card className="bg-blue-50 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        {/* Total Money Paid */}
        <Card className="bg-green-50 border-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Money Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalMoneyPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Collected from payments
            </p>
          </CardContent>
        </Card>

        {/* Expected Revenue */}
        <Card className="bg-purple-50 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {totalExpectedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              If all members pay fully
            </p>
          </CardContent>
        </Card>

        {/* Fully Paid */}
        <Card className="bg-emerald-50 border-emerald-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFullyPaid}</div>
            <p className="text-xs text-muted-foreground">
              {totalFullyPaid > 0 ? `${((totalFullyPaid / totalMembers) * 100).toFixed(1)}% of members` : 'No full payments'}
            </p>
          </CardContent>
        </Card>

        {/* Partially Paid */}
        <Card className="bg-amber-50 border-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Paid</CardTitle>
            <Clock className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPartiallyPaid}</div>
            <p className="text-xs text-muted-foreground">
              {totalPartiallyPaid > 0 ? `${((totalPartiallyPaid / totalMembers) * 100).toFixed(1)}% of members` : 'No partial payments'}
            </p>
          </CardContent>
        </Card>

        {/* Unpaid Members */}
        <Card className="bg-rose-50 border-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Members</CardTitle>
            <XCircle className="h-4 w-4 text-rose-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnpaid}</div>
            <p className="text-xs text-muted-foreground">
              {totalUnpaid > 0 ? `${((totalUnpaid / totalMembers) * 100).toFixed(1)}% of members` : 'All members paid'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls with Dropdowns */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Amount Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getFilterDisplayText('amount', filter)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Payment Amount</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilter('all')}>
              All Payments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('100000')}>
              UGX 100K
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('300000')}>
              UGX 300K
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('fully')}>
              Fully Paid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Gender Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getFilterDisplayText('gender', genderFilter)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Gender</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setGenderFilter('all')}>
              All Genders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGenderFilter('male')}>
              Male ({totalMale})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGenderFilter('female')}>
              Female ({totalFemale})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Accommodation Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getFilterDisplayText('accommodation', accommodationFilter)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Accommodation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setAccommodationFilter('all')}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccommodationFilter('shared')}>
              Shared ({totalSharedAccommodation})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAccommodationFilter('not_shared')}>
              Not Shared ({totalNotSharedAccommodation})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getFilterDisplayText('payment', paymentFilter)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPaymentFilter('all')}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('paid')}>
              Fully Paid ({totalFullyPaid})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('partial')}>
              Partially Paid ({totalPartiallyPaid})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPaymentFilter('unpaid')}>
              Unpaid ({totalUnpaid})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* District Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getFilterDisplayText('district', districtFilter)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            <DropdownMenuLabel>District</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDistrictFilter('all')}>
              All Districts
            </DropdownMenuItem>
            {uniqueDistricts.map((district) => (
              <DropdownMenuItem 
                key={district} 
                onClick={() => setDistrictFilter(district)}
              >
                {district}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters Button */}
        {(filter !== 'all' || genderFilter !== 'all' || accommodationFilter !== 'all' || paymentFilter !== 'all' || districtFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter('all');
              setGenderFilter('all');
              setAccommodationFilter('all');
              setPaymentFilter('all');
              setDistrictFilter('all');
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border-gray-200">
        <CardHeader className="p-3 sm:p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            Member Payment Status ({filteredReports.length} members)
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
                        T-Shirt Size
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Dietary Needs
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Rotary District
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Special Medical Cond.
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Accommodation
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Reminder
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
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.t_shirt_size}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.dietary_needs}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.district}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.gender}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.special_medical_conditions}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.phone_number}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap font-medium">
                          {report.accommodation}
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${report.balance === 0
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
                        <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                          <div className="flex justify-center">
                            <Button
                              onClick={() => handleOpenReminderModal(report)}
                              disabled={!canSendReminder(report) || sendingReminders[report.user_id]}
                              size="sm"
                              variant={report.balance === 0 ? "ghost" : "outline"}
                              className={`text-xs ${report.balance === 0
                                  ? 'text-green-600 bg-green-50 cursor-default'
                                  : canSendReminder(report)
                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                    : 'text-gray-400 bg-gray-50 cursor-default'
                                }`}
                              title={getReminderButtonInfo(report).tooltip}
                            >
                              {report.balance === 0 ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : !canSendReminder(report) ? (
                                <Clock className="h-3 w-3 mr-1" />
                              ) : sendingReminders[report.user_id] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-700 mr-1"></div>
                              ) : (
                                <Mail className="h-3 w-3 mr-1" />
                              )}
                              {getReminderButtonInfo(report).text}
                            </Button>
                          </div>
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
                      {/* Previous button */}
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>

                      {/* Page numbers with dots */}
                      {getPaginationItems().map((item, index) => {
                        if (item === 'ellipsis') {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </span>
                          );
                        }

                        const pageNumber = item as number;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      {/* Next button */}
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSendReminder}
        user={{
          name: selectedUser?.fullName || '',
          email: selectedUser?.email || '',
          amountPaid: selectedUser?.amount_paid || 0,
          balanceDue: selectedUser?.balance || 0,
        }}
        isLoading={selectedUser ? sendingReminders[selectedUser.user_id] : false}
      />
    </div>
  );
}