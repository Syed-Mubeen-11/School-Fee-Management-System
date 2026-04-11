import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, AlertCircle, DollarSign, 
  TrendingUp, TrendingDown, Calendar, ArrowRight,
  Wallet, GraduationCap, School, UserCheck,
  Clock, CheckCircle, XCircle, PieChart,
  Download, RefreshCw, Eye, Activity, Target
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    totalClasses: 0,
    totalFeeCollected: 0,
    todayCollection: 0,
    weeklyCollection: 0,
    monthlyCollection: 0,
    pendingFees: 0,
    defaulters: 0,
    collectionRate: 0,
    paidStudents: 0,
    partialPaidStudents: 0,
    unpaidStudents: 0,
  });
  
  const [recentPayments, setRecentPayments] = useState([]);
  const [topDefaulters, setTopDefaulters] = useState([]);
  const [classWiseStats, setClassWiseStats] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all students
      const studentsRes = await api.get('/students');
      const students = studentsRes.data || [];
      const totalStudents = students.length;

      // Fetch all users to get parent count
      const usersRes = await api.get('/users');
      const allUsers = usersRes.data || [];
      const totalParents = allUsers.filter(u => u.role === 'PARENT').length;

      // Get unique classes
      const uniqueClasses = [...new Set(students.map(s => s.className))];
      const totalClasses = uniqueClasses.length;

      // Calculate all data
      let totalPending = 0;
      let allPayments = [];
      let weeklyTotal = 0;
      let monthlyTotal = 0;
      let yearlyTotal = 0;
      let paidCount = 0;
      let partialCount = 0;
      let unpaidCount = 0;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      
      // Class-wise statistics
      const classMap = new Map();
      const defaulterList = [];

      for (const student of students) {
        // Get total fee from fee structure
        let studentTotalFee = 0;
        try {
          const feeStructureRes = await api.get(`/fee-structure/class/${student.className}`);
          const feeStructures = feeStructureRes.data || [];
          studentTotalFee = feeStructures.reduce((sum, fs) => sum + (fs.amount || 0), 0);
        } catch (err) {
          console.log(`Fee structure failed for class ${student.className}`);
        }

        // Get pending fee
        const pendingRes = await api.get(`/students/${student.id}/pending-fee`);
        const pending = pendingRes.data?.pendingFee || 0;
        const paid = studentTotalFee - pending;
        
        totalPending += pending;

        // Payment status
        if (paid === 0) unpaidCount++;
        else if (pending === 0) paidCount++;
        else partialCount++;

        // Class-wise aggregation
        if (!classMap.has(student.className)) {
          classMap.set(student.className, { 
            total: 0, 
            collected: 0, 
            students: 0,
            pending: 0
          });
        }
        const classData = classMap.get(student.className);
        classData.total += studentTotalFee;
        classData.collected += paid;
        classData.pending += pending;
        classData.students += 1;
        classMap.set(student.className, classData);

        // Get payments for this student
        try {
          const paymentsRes = await api.get(`/payments/student/${student.id}`);
          const studentPayments = paymentsRes.data || [];
          
          studentPayments.forEach(payment => {
            const paymentDate = new Date(payment.paymentDate);
            const amount = payment.amountPaid || 0;
            
            allPayments.push({ 
              ...payment, 
              studentName: student.name, 
              studentId: student.id,
              className: student.className
            });
            
            if (paymentDate >= lastWeek) weeklyTotal += amount;
            if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) monthlyTotal += amount;
            if (paymentDate.getFullYear() === currentYear) yearlyTotal += amount;
          });
        } catch (err) {}

        // Track defaulters
        if (pending > 0) {
          defaulterList.push({
            id: student.id,
            name: student.name,
            rollNo: student.rollNo,
            className: student.className,
            pendingAmount: pending,
            parentEmail: student.parentEmail
          });
        }
      }

      // Calculate today's collection
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = allPayments.filter(p => p.paymentDate === today);
      const todayCollection = todayPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

      // Calculate collection rate (based on monthly target)
      const monthlyTarget = 500000;
      const collectionRate = monthlyTarget > 0 ? (monthlyTotal / monthlyTarget) * 100 : 0;

      // Sort defaulters by pending amount (highest first)
      const topDefaultersList = defaulterList.sort((a, b) => b.pendingAmount - a.pendingAmount).slice(0, 5);

      // Class-wise stats array
      const classStats = Array.from(classMap.entries()).map(([name, data]) => ({
        className: name,
        totalFee: data.total,
        collectedFee: data.collected,
        pendingFee: data.pending,
        students: data.students,
        collectionRate: data.total > 0 ? ((data.collected / data.total) * 100).toFixed(1) : 0
      }));

      // Monthly trend (last 6 months)
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const monthPayments = allPayments.filter(p => {
          const pd = new Date(p.paymentDate);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        });
        const monthTotal = monthPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        trend.push({ month: monthName, amount: monthTotal });
      }

      // Sort recent payments
      const sortedPayments = allPayments.sort((a, b) => 
        new Date(b.paymentDate) - new Date(a.paymentDate)
      ).slice(0, 8);

      setStats({
        totalStudents,
        totalParents,
        totalClasses,
        totalFeeCollected: yearlyTotal,
        todayCollection,
        weeklyCollection: weeklyTotal,
        monthlyCollection: monthlyTotal,
        pendingFees: totalPending,
        defaulters: defaulterList.length,
        collectionRate: collectionRate,
        paidStudents: paidCount,
        partialPaidStudents: partialCount,
        unpaidStudents: unpaidCount,
      });
      
      setRecentPayments(sortedPayments);
      setTopDefaulters(topDefaultersList);
      setClassWiseStats(classStats);
      setMonthlyTrend(trend);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      subtitle: `${stats.totalClasses} classes`,
    },
    {
      title: 'Total Parents',
      value: stats.totalParents,
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: 'Registered guardians',
    },
    {
      title: "Today's Collection",
      value: `₹${stats.todayCollection.toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      subtitle: `Week: ₹${stats.weeklyCollection.toLocaleString()}`,
    },
    {
      title: 'Monthly Collection',
      value: `₹${stats.monthlyCollection.toLocaleString()}`,
      icon: Wallet,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: `Target: ₹500,000`,
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.pendingFees.toLocaleString()}`,
      icon: CreditCard,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      subtitle: `${stats.defaulters} defaulters`,
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate.toFixed(1)}%`,
      icon: Target,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      subtitle: 'of monthly target',
    },
  ];

  const paymentStatusCards = [
    {
      title: 'Fully Paid',
      value: stats.paidStudents,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Partial Payment',
      value: stats.partialPaidStudents,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Not Paid',
      value: stats.unpaidStudents,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

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
          <p className="text-gray-500">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <button 
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
            <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {paymentStatusCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Collection Trend</h2>
        <div className="flex items-end gap-3 h-48">
          {monthlyTrend.map((item, index) => {
            const maxAmount = Math.max(...monthlyTrend.map(t => t.amount), 1);
            const height = (item.amount / maxAmount) * 100;
            return (
              <div key={index} className="flex-1 text-center">
                <div className="bg-indigo-100 rounded-lg relative" style={{ height: `${height}%`, minHeight: '20px' }}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-indigo-600">
                    ₹{(item.amount / 1000).toFixed(0)}k
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.month}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Defaulters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
            <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Top Defaulters
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topDefaulters.length > 0 ? (
              topDefaulters.map((defaulter, index) => (
                <div key={defaulter.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{defaulter.name}</p>
                    <p className="text-xs text-gray-500">{defaulter.rollNo} | Class {defaulter.className}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">₹{defaulter.pendingAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No defaulters found
              </div>
            )}
          </div>
        </div>

        {/* Class-wise Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <School className="w-5 h-5" />
              Class-wise Performance
            </h2>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {classWiseStats.map((classData) => (
              <div key={classData.className} className="px-6 py-3 border-b border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">Class {classData.className}</span>
                  <span className="text-sm text-gray-600">{classData.collectionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${classData.collectionRate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>₹{classData.collectedFee.toLocaleString()} collected</span>
                  <span>₹{classData.pendingFee.toLocaleString()} pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{payment.receiptNo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{payment.studentName || payment.student?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.className || payment.student?.className}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">₹{payment.amountPaid?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.paymentDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentModeBadge(payment.paymentMode)}`}>
                        {payment.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No payments recorded yet
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

export default Dashboard;