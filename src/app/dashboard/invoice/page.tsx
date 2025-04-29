'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function SimpleInvoiceCreation() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState('');
  const [customerTRN, setCustomerTRN] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const [vehicles, setVehicles] = useState([
    { make: '', model: '', year: '', vin: '', color: '', mileage: '', price: 0 }
  ]);
  
  const [subtotal, setSubtotal] = useState(0);
  const [gct, setGct] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Check authentication
  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('steelwheel_user');
      router.push('/auth/login');
    }
  }, [router]);
  
  // Calculate totals whenever vehicles change
  const calculateTotals = () => {
    const newSubtotal = vehicles.reduce((sum, vehicle) => sum + (Number(vehicle.price) || 0), 0);
    const newGct = newSubtotal * 0.15;
    const newTotal = newSubtotal + newGct;
    
    setSubtotal(newSubtotal);
    setGct(newGct);
    setTotal(newTotal);
  };
  
  // Add a new vehicle
  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      { make: '', model: '', year: '', vin: '', color: '', mileage: '', price: 0 }
    ]);
  };
  
  // Remove a vehicle
  const removeVehicle = (index) => {
    const newVehicles = [...vehicles];
    newVehicles.splice(index, 1);
    setVehicles(newVehicles);
    
    // Recalculate totals
    setTimeout(calculateTotals, 0);
  };
  
  // Update vehicle field
  const updateVehicle = (index, field, value) => {
    const newVehicles = [...vehicles];
    newVehicles[index][field] = value;
    setVehicles(newVehicles);
    
    // Recalculate totals if price changes
    if (field === 'price') {
      setTimeout(calculateTotals, 0);
    }
  };
  
  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 900) + 100;
    
    return `INV-${year}${month}${day}-${random}`;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate invoice number if not already set
    const finalInvoiceNumber = invoiceNumber || generateInvoiceNumber();
    setInvoiceNumber(finalInvoiceNumber);
    
    // Create customer and invoice objects
    const customer = {
      full_name: customerName,
      trn: customerTRN,
      address: customerAddress,
      phone: customerPhone,
      email: customerEmail
    };
    
    const invoice = {
      invoice_number: finalInvoiceNumber,
      customer_id: 'temp-id', // In a real app, this would be the ID from the database
      vehicles,
      subtotal,
      gct,
      total,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    
    // In a real app, you would save this to the database
    // For now, we'll just show a success message and offer to download
    toast.success('Invoice created!');
    
    // Save to local storage for demo purposes
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify([...savedInvoices, { customer, invoice }]));
    
    // Generate a plaintext invoice for download
    generatePlaintextInvoice(invoice, customer);
  };
  
  // Generate and download a plaintext invoice
  const generatePlaintextInvoice = (invoice, customer) => {
    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JMD',
      }).format(amount);
    };
    
    // Format date
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    // Generate vehicle details
    const vehicleDetails = invoice.vehicles.map((vehicle, index) => {
      return `Vehicle #${index + 1}:\\n` +
             `  Make: ${vehicle.make}\\n` +
             `  Model: ${vehicle.model}\\n` +
             `  Year: ${vehicle.year}\\n` +
             `  VIN: ${vehicle.vin}\\n` +
             `  Color: ${vehicle.color}\\n` +
             `  Mileage: ${vehicle.mileage}\\n` +
             `  Price: ${formatCurrency(vehicle.price)}\\n`;
    }).join('\\n');
    
    // Create invoice text
    const invoiceText = 
`=======================================================
                STEELWHEEL AUTO INVOICE                 
=======================================================

INVOICE NUMBER: ${invoice.invoice_number}
DATE: ${formatDate(invoice.created_at)}
STATUS: ${invoice.status}

-------------------------------------------------------
CUSTOMER INFORMATION
-------------------------------------------------------
Name: ${customer.full_name}
TRN: ${customer.trn}
Address: ${customer.address}
Phone: ${customer.phone}
Email: ${customer.email}

-------------------------------------------------------
VEHICLE INFORMATION
-------------------------------------------------------
${vehicleDetails}
-------------------------------------------------------
SUMMARY
-------------------------------------------------------
Subtotal: ${formatCurrency(invoice.subtotal)}
GCT (15%): ${formatCurrency(invoice.gct)}

TOTAL DUE: ${formatCurrency(invoice.total)}

=======================================================
Thank you for choosing SteelWheel Auto.
For any inquiries, please contact us.
=======================================================`;
    
    // Create a text file and trigger download
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-navy-900 bg-opacity-70 backdrop-blur-md p-6 rounded-xl border border-blue-500/30 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Invoice</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-300 mb-1">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-blue-300 mb-1">TRN</label>
              <input
                type="text"
                value={customerTRN}
                onChange={(e) => setCustomerTRN(e.target.value)}
                required
                className="w-full p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-blue-300 mb-1">Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
                className="w-full p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-blue-300 mb-1">Phone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-blue-300 mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full p-2 bg-navy-800 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Vehicle Information */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-400">Vehicle Information</h2>
            <button
              type="button"
              onClick={addVehicle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Vehicle
            </button>
          </div>
          
          {vehicles.map((vehicle, index) => (
            <div key={index} className="mb-6 p-4 bg-navy-800 rounded-lg border border-blue-500/20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-blue-300">Vehicle #{index + 1}</h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-300 mb-1">Make</label>
                  <input
                    type="text"
                    value={vehicle.make}
                    onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">Model</label>
                  <input
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">Year</label>
                  <input
                    type="text"
                    value={vehicle.year}
                    onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">VIN</label>
                  <input
                    type="text"
                    value={vehicle.vin}
                    onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={vehicle.color}
                    onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">Mileage</label>
                  <input
                    type="text"
                    value={vehicle.mileage}
                    onChange={(e) => updateVehicle(index, 'mileage', e.target.value)}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-blue-300 mb-1">Price (JMD)</label>
                  <input
                    type="number"
                    value={vehicle.price}
                    onChange={(e) => updateVehicle(index, 'price', Number(e.target.value))}
                    required
                    className="w-full p-2 bg-navy-900 text-white border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Invoice Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">Invoice Summary</h2>
          <div className="bg-navy-800 p-4 rounded-lg border border-blue-500/20">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-blue-300">Subtotal:</div>
              <div className="text-white text-right">JMD ${subtotal.toLocaleString()}</div>
              
              <div className="text-blue-300">GCT (15%):</div>
              <div className="text-white text-right">JMD ${gct.toLocaleString()}</div>
              
              <div className="text-blue-300 font-bold">Total Due:</div>
              <div className="text-green-400 text-right font-bold text-xl">JMD ${total.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
