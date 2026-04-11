import React, { useState, useEffect } from 'react';
import { Search, DollarSign, CreditCard, Wallet, Printer, Download, User, BookOpen, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FeeCollection = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch students');
    }
  };

  const searchStudents = () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter roll number or name');
      return;
    }
    
    setSearchLoading(true);
    const found = students.find(s => 
      s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (found) {
      setSelectedStudent(found);
      fetchStudentFeeDetails(found.id);
    } else {
      toast.error('Student not found');
      setSelectedStudent(null);
    }
    setSearchLoading(false);
  };
const fetchStudentFeeDetails = async (studentId) => {
    try {
        // Get student details to know their class
        const studentRes = await api.get(`/students/${studentId}`);
        const student = studentRes.data;
        const studentClass = student.className;
        
        // Get fee structure for this student's class
        const feeStructureRes = await api.get(`/fee-structure/class/${studentClass}`);
        const feeStructures = feeStructureRes.data || [];
        
        // Calculate total fee by summing all fee heads for this class
        let total = 0;
        feeStructures.forEach(fs => {
            total += fs.amount || 0;
        });
        
        // Get payment history
        const paymentsRes = await api.get(`/payments/student/${studentId}`);
        const payments = paymentsRes.data || [];
        
        // Calculate total paid
        let paid = 0;
        payments.forEach(p => {
            paid += p.amountPaid || 0;
        });
        
        // Calculate pending
        const pending = total - paid;
        
        setTotalFee(total);
        setPaidAmount(paid);
        setPendingAmount(pending);
        setPaymentHistory(payments);
        
    } catch (error) {
        console.error('Fee details error:', error);
        toast.error('Failed to load fee details');
    }
};
  const handleRecordPayment = async () => {
    if (!selectedStudent) {
      toast.error('No student selected');
      return;
    }
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }
    
    if (parseFloat(paymentAmount) > pendingAmount) {
      toast.error(`Amount cannot exceed pending fee of ₹${pendingAmount.toLocaleString()}`);
      return;
    }
    
    setLoading(true);
    
    try {
      const paymentData = {
        studentId: selectedStudent.id,
        amountPaid: parseFloat(paymentAmount),
        paymentMode: paymentMode,
        remarks: remarks || `Fee payment for ${selectedStudent.name}`
      };
      
      const response = await api.post('/payments/record', paymentData);
      setLastPayment(response.data);
      setShowReceipt(true);
      toast.success('Payment recorded successfully!');
      
      // Reset form
      setPaymentAmount('');
      setRemarks('');
      
      // Refresh fee details
      fetchStudentFeeDetails(selectedStudent.id);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentModeIcon = (mode) => {
    switch(mode) {
      case 'CASH': return <Wallet className="w-4 h-4" />;
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'ONLINE': return <Download className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentModeBadge = (mode) => {
    const styles = {
      CASH: 'bg-emerald-100 text-emerald-700',
      CARD: 'bg-blue-100 text-blue-700',
      ONLINE: 'bg-purple-100 text-purple-700',
    };
    return styles[mode] || 'bg-gray-100 text-gray-700';
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewPayment = () => {
    setShowReceipt(false);
    setLastPayment(null);
    setSelectedStudent(null);
    setSearchTerm('');
    setPaymentAmount('');
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Fee Collection</h1>
        <p className="text-gray-500 mt-1">Record student fee payments and generate receipts</p>
      </div>

      {/* Student Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Student</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Roll Number or Student Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            onClick={searchStudents}
            disabled={searchLoading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Student Details and Payment Form */}
      {selectedStudent && !showReceipt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Roll Number</span>
                <span className="font-medium text-gray-800">{selectedStudent.rollNo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Student Name</span>
                <span className="font-medium text-gray-800">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Class & Section</span>
                <span className="font-medium text-gray-800">{selectedStudent.className} - {selectedStudent.section}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Parent Contact</span>
                <span className="font-medium text-gray-800">{selectedStudent.parentEmail || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Fee Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fee Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Fee</span>
                <span className="font-semibold text-gray-800">₹{totalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-semibold text-emerald-600">₹{paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Pending Amount</span>
                <span className="font-bold text-amber-600 text-lg">₹{pendingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Record Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional notes..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={handleRecordPayment}
              disabled={loading || !paymentAmount}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition font-medium disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Record Payment & Generate Receipt'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceipt && lastPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
              <p className="text-gray-500 text-sm">Payment recorded successfully</p>
            </div>

            {/* Receipt Content */}
            <div className="border-t border-b border-gray-100 py-4 my-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800">SCHOOL FEE MANAGER</h3>
                <p className="text-xs text-gray-500">Official Payment Receipt</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Receipt No:</span>
                  <span className="font-mono font-semibold">{lastPayment.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{lastPayment.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-medium">{selectedStudent?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Roll Number:</span>
                  <span>{selectedStudent?.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Class:</span>
                  <span>{selectedStudent?.className} - {selectedStudent?.section}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">₹{lastPayment.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Mode:</span>
                  <span className="capitalize">{lastPayment.paymentMode}</span>
                </div>
                {lastPayment.remarks && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remarks:</span>
                    <span className="text-sm">{lastPayment.remarks}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleNewPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition"
              >
                New Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {selectedStudent && paymentHistory.length > 0 && !showReceipt && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">{payment.receiptNo}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{payment.paymentDate}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-emerald-600">₹{payment.amountPaid?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getPaymentModeBadge(payment.paymentMode)}`}>
                        {getPaymentModeIcon(payment.paymentMode)}
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{payment.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedStudent && !showReceipt && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Search for a student</h3>
          <p className="text-gray-400 text-sm mt-1">Enter roll number or name to record fee payment</p>
        </div>
      )}
    </div>
  );
};

export default FeeCollection;