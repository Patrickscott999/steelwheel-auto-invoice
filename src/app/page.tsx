'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after a brief delay
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 2500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center galaxy-bg">
      <div className="text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 font-orbitron">
            SteelWheel <span className="text-electric-blue">Auto</span>
          </h1>
          <p className="text-xl text-blue-300 mb-8 font-poppins">
            Car Dealership Invoice Generator
          </p>
          <div className="text-blue-400 text-sm animate-pulse">
            Redirecting to login...
          </div>
        </motion.div>
      </div>
    </main>
  );
}
