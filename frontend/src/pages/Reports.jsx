import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [defaulters, setDefaulters] = useState([]);
  const [dailyPayments, setDailyPayments] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2024, 2025, 2026];

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyReport();
    } else if (activeTab === 'monthly') {
      fetchMonthlyReport();
    } else if (activeTab === 'defaulters') {
      fetchDefaulters();
    }
  }, [activeTab, selectedDate, selectedMonth, selectedYear]);

  // Fetch daily report
  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/collection/daily?date=${selectedDate}`);
      setDailyTotal(response.data?.totalCollection || 0);
      setDailyPayments([]);
    } catch (error) {
      console.error('Daily report error:', error);
      setDailyTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/collection/monthly?year=${selectedYear}&month=${selectedMonth}`);
      setMonthlyTotal(response.data?.totalCollection || 0);
      setMonthlyPayments([]);
    } catch (error) {
      console.error('Monthly report error:', error);
      setMonthlyTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch defaulters
  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/defaulters');
      setDefaulters(response.data || []);
    } catch (error) {
      console.error('Defaulters error:', error);
      toast.error('Failed to load defaulters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View collection reports and fee analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
            activeTab === 'daily'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Daily Collection
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Monthly Collection
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
            activeTab === 'defaulters'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Defaulters
        </button>
      </div>

      {/* Daily Collection Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Daily Collection Report</h2>
                <p className="text-gray-500 text-sm">View total collection for a specific date</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Total Collection</p>
                <p className="text-3xl font-bold">₹{dailyTotal.toLocaleString()}</p>
                <p className="text-indigo-100 text-sm mt-1">for {selectedDate}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          {dailyTotal === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">No payments recorded for this date</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly Collection Tab */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Monthly Collection Report</h2>
                <p className="text-gray-500 text-sm">View total collection for a specific month</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Collection</p>
                <p className="text-3xl font-bold">₹{monthlyTotal.toLocaleString()}</p>
                <p className="text-emerald-100 text-sm mt-1">{months[selectedMonth - 1]} {selectedYear}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          {monthlyTotal === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">No payments recorded for this month</p>
            </div>
          )}
        </div>
      )}

      {/* Defaulters Tab */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Fee Defaulters</h2>
                <p className="text-gray-500 text-sm">Students with pending fee payments</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm">Total Defaulters</p>
                <p className="text-2xl font-bold text-red-700">{defaulters.length} Students</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Defaulters Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {defaulters.length > 0 ? (
                    defaulters.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.rollNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.className}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.section}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">
                          ₹{(student.pendingAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No defaulters found. All fees are paid!
                      </td>
                    </tr>
                  )}
                </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;