import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, X, DollarSign, BookOpen, Bus, Library, FlaskConical } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FeeStructure = () => {
  const [feeHeads, setFeeHeads] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddHead, setShowAddHead] = useState(false);
  const [newHeadName, setNewHeadName] = useState('');
  const [editingAmount, setEditingAmount] = useState(null);
  const [selectedClass, setSelectedClass] = useState('1');

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  
  const headIcons = {
    'Tuition': <BookOpen className="w-4 h-4" />,
    'Transport': <Bus className="w-4 h-4" />,
    'Library': <Library className="w-4 h-4" />,
    'Lab': <FlaskConical className="w-4 h-4" />,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch fee heads
      const headsRes = await api.get('/fee-structure/heads');
      setFeeHeads(headsRes.data || []);
      
      // Fetch all fee structures
      const structureRes = await api.get('/fee-structure');
      setFeeStructure(structureRes.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeeHead = async () => {
    if (!newHeadName.trim()) {
      toast.error('Please enter fee head name');
      return;
    }
    
    try {
      const response = await api.post('/fee-structure/heads', { name: newHeadName });
      setFeeHeads([...feeHeads, response.data]);
      setNewHeadName('');
      setShowAddHead(false);
      toast.success('Fee head added successfully');
      fetchData(); // Refresh to get updated structure
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add fee head');
    }
  };

  const handleDeleteFeeHead = async (id, name) => {
    if (window.confirm(`Delete "${name}"? This will remove it from all classes.`)) {
        try {
            await api.delete(`/fee-structure/heads/${id}`);
            toast.success('Fee head deleted successfully');
            fetchData(); // Refresh the page
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete fee head');
        }
    }
};

  const getAmountForClass = (className, feeHeadId) => {
    const item = feeStructure.find(
      fs => fs.className === className && fs.feeHead?.id === feeHeadId
    );
    return item?.amount || 0;
  };

  const getStructureId = (className, feeHeadId) => {
    const item = feeStructure.find(
      fs => fs.className === className && fs.feeHead?.id === feeHeadId
    );
    return item?.id;
  };

  const handleAmountChange = (className, feeHeadId, value) => {
    const amount = parseFloat(value) || 0;
    setEditingAmount({ className, feeHeadId, amount });
  };

  const handleSaveAmount = async (className, feeHeadId) => {
    if (!editingAmount || editingAmount.className !== className || editingAmount.feeHeadId !== feeHeadId) {
      return;
    }
    
    try {
      const structureId = getStructureId(className, feeHeadId);
      const data = {
        className: className,
        feeHead: { id: feeHeadId },
        amount: editingAmount.amount
      };
      
      if (structureId) {
        await api.put(`/fee-structure/${structureId}`, data);
      } else {
        await api.post('/fee-structure', data);
      }
      
      toast.success(`Updated ${className} fee`);
      setEditingAmount(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save amount');
    }
  };

  const calculateTotalForClass = (className) => {
    let total = 0;
    feeHeads.forEach(head => {
      const amount = getAmountForClass(className, head.id);
      total += amount;
    });
    return total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading fee structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fee Structure</h1>
          <p className="text-gray-500 mt-1">Manage fee heads and class-wise amounts</p>
        </div>
        <button
          onClick={() => setShowAddHead(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Fee Head
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {classes.map(c => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedClass === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Class {c}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Heads List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fee Heads</h2>
          <div className="space-y-2">
            {feeHeads.map((head) => (
              <div
                key={head.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    {headIcons[head.name] || <DollarSign className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-gray-800">{head.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteFeeHead(head.id, head.name)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {feeHeads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No fee heads added yet
              </div>
            )}
          </div>
        </div>

        {/* Fee Amounts for Selected Class */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Fee Amounts - Class {selectedClass}
          </h2>
          
          <div className="space-y-3">
            {feeHeads.map((head) => {
              const currentAmount = getAmountForClass(selectedClass, head.id);
              const isEditing = editingAmount?.className === selectedClass && editingAmount?.feeHeadId === head.id;
              
              return (
                <div
                  key={head.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      {headIcons[head.name] || <DollarSign className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{head.name}</p>
                      <p className="text-xs text-gray-400">Fee head</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={editingAmount.amount}
                          onChange={(e) => handleAmountChange(selectedClass, head.id, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Amount"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveAmount(selectedClass, head.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingAmount(null)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{currentAmount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setEditingAmount({ className: selectedClass, feeHeadId: head.id, amount: currentAmount })}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total for Class */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">Total Fee for Class {selectedClass}</p>
                <p className="text-sm text-gray-500">Sum of all fee heads</p>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                ₹{calculateTotalForClass(selectedClass).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Fee Head Modal */}
      {showAddHead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Fee Head</h2>
              <button
                onClick={() => setShowAddHead(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Head Name
                </label>
                <input
                  type="text"
                  value={newHeadName}
                  onChange={(e) => setNewHeadName(e.target.value)}
                  placeholder="e.g., Sports, Computer Lab"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">
                  Examples: Tuition, Transport, Library, Lab, Sports, Computer
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddHead(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFeeHead}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructure;