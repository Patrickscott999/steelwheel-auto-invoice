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
      if (userData.email !== 'Samantha_p_scott@yahoo.com') {
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
  const removeVehicle = (index: number) => {
    const newVehicles = [...vehicles];
    newVehicles.splice(index, 1);
    setVehicles(newVehicles);
    
    // Recalculate totals
    setTimeout(calculateTotals, 0);
  };
  
  // Update vehicle field
  const updateVehicle = (index: number, field: string, value: string | number) => {
    const newVehicles = [...vehicles];
    (newVehicles[index] as any)[field] = value;
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
      
      // Generate PDF invoice for download
      const pdfBlob = await generatePDFInvoice(invoice, customer);
      
      // Email the PDF invoice to customer and CEO
      if (pdfBlob) {
        await emailPDFInvoice(invoice, customer, pdfBlob);
      } else {
        toast.error('Failed to generate PDF for email attachment.');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('There was an error processing the invoice.');
    }
  };
  
  // Generate invoice content in formatted text
  const generateInvoiceContent = (invoice: any, customer: any): string => {
    // Format currency
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JMD',
      }).format(amount);
    };
    
    // Format date
    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    // Generate vehicle details
    const vehicleDetails = invoice.vehicles.map((vehicle: any, index: number) => {
      return `Vehicle #${index + 1}:\n` +
             `  Make: ${vehicle.make}\n` +
             `  Model: ${vehicle.model}\n` +
             `  Year: ${vehicle.year}\n` +
             `  VIN: ${vehicle.vin}\n` +
             `  Color: ${vehicle.color}\n` +
             `  Mileage: ${vehicle.mileage}\n` +
             `  Price: ${formatCurrency(vehicle.price)}\n`;
    }).join('\n');
    
    // Create invoice text
    return `=======================================================
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
  };
  
  // Email the PDF invoice to both customer and CEO
  const emailPDFInvoice = async (invoice: any, customer: any, pdfBlob: Blob): Promise<void> => {
    try {
      // Convert the PDF blob to a base64 string for email attachment
      const reader = new FileReader();
      
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64Content = base64.split(',')[1];
          resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      
      const ceoEmail = 'Samantha_p_scott@yahoo.com';
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [customer.email, ceoEmail],
          subject: `SteelWheel Auto Invoice #${invoice.invoice_number}`,
          text: `Dear ${customer.email === ceoEmail ? 'CEO' : customer.full_name},\n\nPlease find attached your invoice #${invoice.invoice_number} from SteelWheel Auto.\n\nThank you for your business!\n\nSteelWheel Auto Team`,
          html: `<div style="font-family: Arial, sans-serif; color: #333;"><p>Dear ${customer.email === ceoEmail ? 'CEO' : customer.full_name},</p><p>Please find attached your invoice #${invoice.invoice_number} from SteelWheel Auto.</p><p>Thank you for your business!</p><p>SteelWheel Auto Team</p><div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">SteelWheel Auto - Excellence in automotive sales</div></div>`,
          attachmentContent: pdfBase64,
          attachmentFilename: `${invoice.invoice_number}.pdf`,
          attachmentContentType: 'application/pdf',
          isBase64: true
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('PDF Invoice emailed successfully!');
        console.log('Email preview URL:', data.previewUrl);
      } else {
        toast.error('Failed to email PDF invoice.');
        console.error('Email error:', data.error);
      }
    } catch (error) {
      toast.error('Failed to email PDF invoice.');
      console.error('Email error:', error);
    }
  };
  
  // Generate and download a PDF invoice
  const generatePDFInvoice = async (invoice: any, customer: any): Promise<Blob | undefined> => {
    try {
      // Call our API to generate a PDF invoice
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice, customer }),
      });
      
      if (!response.ok) {
        throw new Error(`Error generating PDF: ${response.statusText}`);
      }
      
      // Get the PDF blob from the response
      const pdfBlob = await response.blob();
      
      // Create a URL for the blob and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF invoice.');
      throw error;
    }
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
