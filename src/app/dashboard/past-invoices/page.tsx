'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/lib/supabase';
import { Invoice, Customer } from '@/types';
import InvoiceActions from '@/components/InvoiceActions';

export default function PastInvoices() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // Check auth status using localStorage for demo
    const checkAuth = () => {
      const userString = localStorage.getItem('steelwheel_user');
      
      if (!userString) {
        router.push('/auth/login');
        return;
      }
      
      try {
        const user = JSON.parse(userString);
        if (user.email !== 'ceo@dealership.com') {
          localStorage.removeItem('steelwheel_user');
          router.push('/auth/login');
        } else {
          setUser(user);
          // Fetch invoices
          fetchInvoices();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('steelwheel_user');
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (invoicesError) throw invoicesError;
      
      if (invoicesData) {
        // Fetch customers for all invoices
        const customerIds = [...new Set(invoicesData.map(inv => inv.customer_id))];
        
        if (customerIds.length > 0) {
          const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('*')
            .in('id', customerIds);
          
          if (customersError) throw customersError;
          
          // Create a lookup map for customers
          const customersMap: Record<string, Customer> = {};
          customersData?.forEach(customer => {
            customersMap[customer.id] = customer;
          });
          
          setCustomers(customersMap);
        }
        
        setInvoices(invoicesData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedCustomer(customers[invoice.customer_id]);
  };
  
  const handleCloseModal = () => {
    setSelectedInvoice(null);
    setSelectedCustomer(null);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    // In a real application, you would navigate to an edit page or open an edit modal
    // For now, let's just show a toast
    toast.info('Edit functionality to be implemented');
  };
  
  const handleCreateNewInvoice = () => {
    router.push('/dashboard/invoice');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('steelwheel_user');
    router.push('/auth/login');
  };
  
  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const customer = customers[invoice.customer_id];
    
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      customer?.full_name?.toLowerCase().includes(searchLower) ||
      (new Date(invoice.created_at || '').toLocaleDateString().includes(searchTerm))
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center galaxy-bg">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen galaxy-bg">
      <ToastContainer position="top-center" />
      
      <div className="container mx-auto p-4 pt-8">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-white font-orbitron">Past <span className="text-electric-blue">Invoices</span></h1>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Invoice
            </motion.button>
            
            <div className="mr-4 text-blue-300">
              <span className="text-sm">CEO:</span> {user.email}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-navy-700 text-white rounded-md border border-blue-500/30 hover:bg-navy-800 transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-navy-900 bg-opacity-70 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-xl relative z-10"
        >
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="text"
                placeholder="Search by Invoice #, Customer Name, or Date"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full max-w-md p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-blue-300">Loading invoices...</div>
              </div>
            ) : (
              <>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-blue-300">No invoices found</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-500/20">
                      <thead className="bg-navy-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Invoice #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Total (JMD)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-navy-900 divide-y divide-blue-500/10">
                        {filteredInvoices.map((invoice) => {
                          const customer = customers[invoice.customer_id];
                          return (
                            <tr key={invoice.id} className="hover:bg-navy-800 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.invoice_number}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {new Date(invoice.created_at || '').toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{customer?.full_name || 'Unknown'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${invoice.total.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  invoice.status === 'Paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : invoice.status === 'Cancelled' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewInvoice(invoice)}
                                  className="text-blue-400 hover:text-blue-300 mr-3"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEditInvoice(invoice)}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Invoice Detail Modal */}
      {selectedInvoice && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-70">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-900 rounded-xl border border-blue-500/30 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white font-orbitron">Invoice <span className="text-electric-blue">Details</span></h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-blue-300 text-sm">Invoice Number</p>
                  <p className="text-white">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Date</p>
                  <p className="text-white">{new Date(selectedInvoice.created_at || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Status</p>
                  <p className={`${
                    selectedInvoice.status === 'Paid' 
                      ? 'text-green-400' 
                      : selectedInvoice.status === 'Cancelled' 
                        ? 'text-red-400' 
                        : 'text-yellow-400'
                  }`}>{selectedInvoice.status}</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-electric-blue mb-2 font-orbitron">Customer</h3>
              <div className="bg-navy-800 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-blue-300 text-sm">Name</p>
                    <p className="text-white">{selectedCustomer.full_name}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">TRN</p>
                    <p className="text-white">{selectedCustomer.trn}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Email</p>
                    <p className="text-white">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Phone</p>
                    <p className="text-white">{selectedCustomer.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-blue-300 text-sm">Address</p>
                    <p className="text-white">{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-electric-blue mb-2 font-orbitron">Vehicles</h3>
              <div className="bg-navy-800 p-4 rounded-lg mb-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-500/20">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Make</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Model</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Year</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">VIN</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Color</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Mileage</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Price (JMD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {selectedInvoice.vehicles.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.make}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.model}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.year}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.vin}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.color}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{vehicle.mileage}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-white">${vehicle.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <h3 className="text-xl font-semibold text-electric-blue mb-2 font-orbitron">Summary</h3>
              <div className="bg-navy-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-blue-300">Subtotal:</span>
                  <span className="text-white">JMD ${selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-300">GCT (15%):</span>
                  <span className="text-white">JMD ${selectedInvoice.gct.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-500/20 pt-2 mt-2">
                  <span className="text-blue-300 font-semibold">Total Due:</span>
                  <span className="text-neon-green font-bold">JMD ${selectedInvoice.total.toLocaleString()}</span>
                </div>
              </div>
              
              <InvoiceActions invoice={selectedInvoice} customer={selectedCustomer} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
