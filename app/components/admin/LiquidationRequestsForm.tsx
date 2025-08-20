// app/components/admin/LiquidationRequestsPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

interface LiquidationRequest {
  id: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  accountName: string;
  mobileNumber?: string;
  network?: string;
  reason: string;
  disbursementDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requesterId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
}

export default function LiquidationRequestsPage({ 
  session, 
  isAdmin,
  isRequester,
  isApprover
}: { 
  session: any;
  isAdmin: boolean;
  isRequester: boolean;
  isApprover: boolean;
}) {
  const [requests, setRequests] = useState<LiquidationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LiquidationRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/liquidation-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      toast.error('Failed to load requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
  try {
    const response = await fetch(`/api/liquidation-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update status');
    }

    toast.success(`Request ${status} successfully`);
    fetchRequests(); // Refresh the list
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    toast.error(errorMessage);
    console.error('Error updating status:', error);
  }
};

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, text: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, text: 'Rejected' },
      processed: { variant: 'outline', icon: CheckCircle, text: 'Processed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPaymentMethodDisplay = (method: string) => {
    return method === 'bank' ? 'Bank Transfer' : 'Mobile Money';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liquidation Requests</h1>
            <p className="text-gray-600 mt-2">Manage and review all fund liquidation requests</p>
            {isApprover && (
              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approver Access
              </Badge>
            )}
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, account, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(requests.reduce((sum, r) => sum + r.amount, 0))}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>
              {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              {!isApprover && ' - View only mode'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Disbursement Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.requesterName}</p>
                          <p className="text-sm text-gray-500">{request.requesterId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(request.amount)}
                      </TableCell>
                      <TableCell>{getPaymentMethodDisplay(request.paymentMethod)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.accountName}</p>
                          <p className="text-sm text-gray-500">
                            {request.paymentMethod === 'bank' 
                              ? `${request.bankName} • ${request.accountNumber}`
                              : `${request.network} • ${request.mobileNumber}`
                            }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(request.disbursementDate)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {/* Only show approve/reject actions to approvers */}
                            {isApprover && (
                              <>
                                <DropdownMenuSeparator />
                                {request.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'approved')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <DropdownMenuItem
                                    onClick={() => updateRequestStatus(request.id, 'processed')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                    Mark as Processed
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No liquidation requests have been submitted yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                  Request ID: {selectedRequest.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Requester</h4>
                    <p className="text-gray-600">{selectedRequest.requesterName}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.requesterId}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Amount</h4>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Payment Method</h4>
                    <p className="text-gray-600">
                      {getPaymentMethodDisplay(selectedRequest.paymentMethod)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Account Details</h4>
                  <p className="text-gray-600">{selectedRequest.accountName}</p>
                  {selectedRequest.paymentMethod === 'bank' ? (
                    <div className="text-sm text-gray-500 mt-1">
                      <p>{selectedRequest.bankName}</p>
                      <p>{selectedRequest.accountNumber}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mt-1">
                      <p>{selectedRequest.network}</p>
                      <p>{selectedRequest.mobileNumber}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Disbursement Date</h4>
                  <p className="text-gray-600">{formatDate(selectedRequest.disbursementDate)}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Reason</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedRequest.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p>Created: {formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  <div>
                    <p>Last updated: {formatDate(selectedRequest.updatedAt)}</p>
                  </div>
                </div>

                {/* Action buttons in detail view - only for approvers */}
                {isApprover && selectedRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'approved');
                        setIsDetailOpen(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'rejected');
                        setIsDetailOpen(false);
                      }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {isApprover && selectedRequest.status === 'approved' && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'processed');
                        setIsDetailOpen(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Processed
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}