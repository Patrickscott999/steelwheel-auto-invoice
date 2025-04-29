'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard/invoice');
      }
    };
    
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demonstration purposes, let's create a mock login since we don't have
      // actual Supabase auth setup with the CEO account yet
      if (email === 'ceo@dealership.com' && password.length > 0) {
        // This would normally be a real authentication call:
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        toast.success('Login successful!');
        
        // Store some session data in localStorage for demo purposes
        localStorage.setItem('steelwheel_user', JSON.stringify({ email: 'ceo@dealership.com', role: 'ceo' }));
        
        // Redirect to invoice page
        router.push('/dashboard/invoice');
      } else if (email === 'ceo@dealership.com') {
        toast.error('Invalid password');
      } else {
        // This is non-CEO user
        toast.error('Access Denied. Only the CEO can access this application.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center galaxy-bg p-4">
      <ToastContainer position="top-center" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 p-8 bg-navy-900 bg-opacity-80 backdrop-blur-md rounded-xl shadow-xl border border-blue-500/30"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-orbitron mb-2">SteelWheel Auto</h2>
          <p className="text-blue-400 font-poppins">Invoice Generator</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-300 font-poppins">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 mt-1 border border-blue-500/30 bg-navy-800 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-poppins"
                placeholder="ceo@dealership.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-300 font-poppins">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 mt-1 border border-blue-500/30 bg-navy-800 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-poppins"
                placeholder="********"
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out font-poppins"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
