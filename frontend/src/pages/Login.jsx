import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, name, role, userId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, role, userId, email }));
      
      toast.success(`Welcome back, ${name}!`);
      
      if (role === 'ADMIN') {
        navigate('/dashboard');
      } else if (role === 'ACCOUNTANT') {
        navigate('/collection');
      } else if (role === 'PARENT') {
        navigate('/parent-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('❌ Invalid email or password. Please try again.');
        toast.error('Invalid email or password');
      } else if (error.response?.status === 404) {
        setErrorMessage('❌ User not found. Please check your email.');
        toast.error('User not found');
      } else if (error.response?.data?.error) {
        setErrorMessage(`❌ ${error.response.data.error}`);
        toast.error(error.response.data.error);
      } else {
        setErrorMessage('❌ Something went wrong. Please try again later.');
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* LEFT SIDE - Image & Description */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <span className="text-xl font-bold">FeeManager</span>
          </div>
          
          {/* Center Content - Image & Description */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            
            {/* Image */}
            <img 
              src="/images.jpeg" 
              alt="School Management" 
              className="w-56 h-56 object-cover rounded-2xl border border-white/20 shadow-xl mb-6"
            />
            
            <h1 className="text-3xl font-bold mb-3">Simplify School Fee Management</h1>
            <p className="text-white/80 max-w-sm text-sm">
              Track, collect, and manage school fees effortlessly with our all-in-one platform.
              Save time and get real-time insights.
            </p>
          </div>
          
          {/* Bottom - Demo Credentials (Updated with your actual users) */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-white/60 text-xs text-center mb-1">Demo Credentials:</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-white/10 text-white/80 rounded-lg">Admin: admin@school.com</span>
              <span className="px-2 py-1 bg-white/10 text-white/80 rounded-lg">Accountant: accountant@school.com</span>
              <span className="px-2 py-1 bg-white/10 text-white/80 rounded-lg">Parent: parent1@test.com</span>
            </div>
            <p className="text-center text-white/40 text-xs mt-1">
              Password: admin123 / acc123 / parent1
            </p>
          </div>
        </div>
      </div>
      
      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="max-w-sm w-full">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>
          
          {/* Form */}
          <div>
            <div className="hidden lg:block mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
              <p className="text-gray-500 text-sm">Sign in to continue</p>
            </div>
            
            {/* Error Message Display */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border ${errorMessage ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} rounded-xl focus:border-transparent outline-none transition`}
                    placeholder="admin@school.com"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2 text-sm">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border ${errorMessage ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'} rounded-xl focus:border-transparent outline-none transition`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                  <span className="ml-2 text-gray-600 text-sm">Remember me</span>
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Secure access for administrators, accountants, and parents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;