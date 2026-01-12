import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { authApi } from '../services/api';
import { Lock, Mail, User, AlertCircle, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await authApi.login(email, password);
      } else {
        data = await authApi.register(name, email, password);
      }
      
      login(data.token, data.user);
      
      // Role-based redirection
      if (data.user.role === 'admin') {
          navigate('/admin', { replace: true });
      } else if (data.user.role === 'doctor') {
          navigate('/doctor-dashboard', { replace: true });
      } else {
          // If came from a specific protected page, go there, else patient dashboard
          if (from !== '/' && from !== '/login') {
            navigate(from, { replace: true });
          } else {
            navigate('/patient-dashboard', { replace: true });
          }
      }

    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=2000" 
            alt="Medical Laboratory" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">AD Hospital</h1>
            <p className="text-lg text-slate-300">Excellence in Healthcare Management</p>
          </div>
          <div className="space-y-4">
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
               <p className="italic text-slate-200">"The art of medicine consists of amusing the patient while nature cures the disease."</p>
               <div className="mt-4 text-sm font-semibold">— Voltaire</div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-20 relative">
        <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Please enter your details to sign in.' : 'Create your account to manage appointments.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  // Clear fields on switch to prevent confusion
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400 text-center space-y-1">
            <p><span className="font-semibold">Demo Admin:</span> admin@medicare.com / admin123</p>
            <p><span className="font-semibold">Demo Doctor:</span> sarah@hospital.com / doctor123</p>
            <p><span className="font-semibold">Demo Patient:</span> patient@test.com / patient123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;