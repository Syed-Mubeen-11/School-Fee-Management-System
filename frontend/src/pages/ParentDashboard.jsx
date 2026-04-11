import React, { useState, useEffect } from 'react';
import { User, BookOpen, DollarSign, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [feeSummary, setFeeSummary] = useState({
    totalFee: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [feeBreakdown, setFeeBreakdown] = useState([]);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userEmail = user?.email;

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      // Get all students and find the one linked to this parent email
      const studentsRes = await api.get('/students');
      const allStudents = studentsRes.data || [];
      
      // Find student where parent email matches logged in user's email
      const parentStudent = allStudents.find(s => s.parentEmail === userEmail);
      
      if (!parentStudent) {
        setLoading(false);
        return;
      }
      
      setStudent(parentStudent);
      
      // Get fee structure for this student's class
      const feeStructureRes = await api.get(`/fee-structure/class/${parentStudent.className}`);
      const structures = feeStructureRes.data || [];
      
      // Calculate total fee
      let total = 0;
      const breakdown = [];
      structures.forEach(fs => {
        const amount = fs.amount || 0;
        total += amount;
        breakdown.push({
          name: fs.feeHead?.name || 'Fee',
          amount: amount
        });
      });
      
      // Get payment history for this student
      const paymentsRes = await api.get(`/payments/student/${parentStudent.id}`);
      const payments = paymentsRes.data || [];
      
      // Calculate total paid
      let paid = 0;
      payments.forEach(p => {
        paid += p.amountPaid || 0;
      });
      
      const pending = total - paid;
      
      setFeeSummary({
        totalFee: total,
        paidAmount: paid,
        pendingAmount: pending,
      });
      
      setPaymentHistory(payments);
      setFeeBreakdown(breakdown);
      
    } catch (error) {
      console.error('Parent dashboard error:', error);
      toast.error('Failed to load your child\'s information');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your child's information...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Student Found</h2>
          <p className="text-gray-500">
            Your account is not linked to any student yet. Please contact the school administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your child's fee details and payment history</p>
      </div>

      {/* Student Info Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-indigo-100">Roll No: {student.rollNo} | Class {student.className} - {student.section}</p>
            <p className="text-indigo-100 text-sm mt-1">Parent: {student.parentName || user?.name}</p>
          </div>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fee</p>
              <p className="text-2xl font-bold text-gray-800">₹{feeSummary.totalFee.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="text-2xl font-bold text-emerald-600">₹{feeSummary.paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className={`text-2xl font-bold ${feeSummary.pendingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{feeSummary.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 ${feeSummary.pendingAmount > 0 ? 'bg-amber-100' : 'bg-emerald-100'} rounded-xl flex items-center justify-center`}>
              {feeSummary.pendingAmount > 0 ? (
                <Clock className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Fee Breakdown</h2>
          <p className="text-gray-500 text-sm">Class {student.className} fee structure</p>
        </div>
        <div className="divide-y divide-gray-100">
          {feeBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-6 py-4">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-800">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-bold text-indigo-600 text-lg">₹{feeSummary.totalFee.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className={`rounded-2xl p-6 text-center ${
        feeSummary.pendingAmount === 0 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {feeSummary.pendingAmount === 0 ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span className="text-emerald-700 font-medium">All fees paid! Your child has no pending dues.</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-amber-700 font-medium">Pending Amount: ₹{feeSummary.pendingAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
          <p className="text-gray-500 text-sm">All fee payments made for your child</p>
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
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{payment.receiptNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentDate}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">₹{payment.amountPaid?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentModeBadge(payment.paymentMode)}`}>
                        {payment.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No payment history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;