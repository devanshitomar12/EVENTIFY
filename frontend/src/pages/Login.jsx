import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
      
      // Smart redirect based on role
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedInUser.role === 'ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluator review
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Heading */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm tracking-tighter">
              EV
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Eventify</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-gray-500">
            Access your bookings, tickets, and organizer dashboard
          </p>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
            <span className="flex items-center gap-1.5 text-brand-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Demo accounts:
            </span>
            <span className="text-gray-400 text-xs">One-click fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@eventify.com', 'Admin@123')}
              className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200 transition-colors text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('organizer@eventify.com', 'Organizer@123')}
              className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200 transition-colors text-center"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user@eventify.com', 'User@123')}
              className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200 transition-colors text-center"
            >
              Attendee
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Switch to Register */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
