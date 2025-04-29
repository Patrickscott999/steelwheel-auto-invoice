'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

// Define types locally to avoid dependencies
type Vehicle = {
  make: string;
  model: string;
  year: string;
  vin: string;
  color: string;
  mileage: string;
  price: number;
};

type Customer = {
  full_name: string;
  trn: string;
  address: string;
  phone: string;
  email: string;
};

type Invoice = {
  invoice_number: string;
  customer_id?: string;
  vehicles: Vehicle[];
  subtotal: number;
  gct: number;
  total: number;
  status: string;
  created_at: string;
};

interface InvoiceActionsProps {
  invoice: Invoice;
  customer: Customer;
}

export default function InvoiceActions({ invoice, customer }: InvoiceActionsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Generate invoice text directly on the client
  const generateInvoiceText = () => {
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JMD',
      }).format(amount);
    };
    
    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    // Generate vehicle details
    const vehicleDetails = invoice.vehicles.map((vehicle, index) => {
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

  const handleDownloadInvoice = () => {
    setLoadingPdf(true);
    try {
      // Generate the invoice text content directly
      const invoiceText = generateInvoiceText();
      
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
      
      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Failed to generate invoice document');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    setLoadingEmail(true);
    try {
      // For a real application, you would create an API endpoint to:
      // 1. Generate the PDF server-side (like we're already doing)
      // 2. Send the email with the PDF attached using a service like SendGrid, AWS SES, etc.
      
      // For now, we'll simulate the API call for sending an email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show a toast about where the email would be sent in a real application
      toast.success(
        <div>
          <p>Email would be sent to: <strong>{customer.email}</strong></p>
          <p className="text-xs mt-1">Subject: Your Invoice from SteelWheel Auto</p>
          <p className="text-xs italic">*This is a simulation. No actual email was sent.</p>
        </div>
      );
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="flex space-x-4 mt-6">
      <button
        onClick={handleDownloadInvoice}
        disabled={loadingPdf}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center transform hover:scale-105 active:scale-95"
      >
        {loadingPdf ? 'Generating...' : 'Download Invoice'}
      </button>
      
      <button
        onClick={handleSendEmail}
        disabled={loadingEmail}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center transform hover:scale-105 active:scale-95"
      >
        {loadingEmail ? 'Sending...' : 'Send Invoice by Email'}
      </button>
    </div>
  );
}
