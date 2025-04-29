'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in using localStorage
    const userString = localStorage.getItem('steelwheel_user');
    if (!userString) {
      router.push('/auth/login');
      return;
    }

    try {
      const userData = JSON.parse(userString);
      if (userData.email !== 'ceo@dealership.com') {
        localStorage.removeItem('steelwheel_user');
        router.push('/auth/login');
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('steelwheel_user');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('steelwheel_user');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center galaxy-bg">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen galaxy-bg">
      <ToastContainer position="top-center" />

      <header className="bg-navy-900 border-b border-blue-500/30">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white font-orbitron">
            SteelWheel <span className="text-electric-blue">Auto</span>
          </h1>

          <div className="flex items-center space-x-4">
            <div className="mr-4 text-blue-300 hidden md:block">
              <span className="text-sm">CEO:</span> {user?.email}
            </div>

            <div className="flex space-x-2">
              <Link href="/dashboard/invoice" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                New Invoice
              </Link>
              <Link href="/dashboard/past-invoices" className="px-3 py-1.5 bg-navy-700 text-white rounded border border-blue-500/30 hover:bg-navy-800 transition-colors">
                Past Invoices
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-navy-700 text-white rounded border border-blue-500/30 hover:bg-navy-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-8">
        {children}
      </main>
    </div>
  );
}
