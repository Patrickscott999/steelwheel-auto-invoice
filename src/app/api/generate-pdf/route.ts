import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePDF, { generatePDF } from '@/components/InvoicePDF';
import { Customer, Invoice, Vehicle } from '@/types';
import { generateInvoiceDescription } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    // Get invoice and customer data from request body
    const requestData = await req.json();
    const { invoice: rawInvoice, customer } = requestData as { 
      invoice: any; 
      customer: Customer 
    };
    
    if (!rawInvoice || !customer) {
      return NextResponse.json(
        { error: 'Invoice and customer data are required' },
        { status: 400 }
      );
    }
    
    // Ensure invoice object conforms to the Invoice type with required fields
    const invoice: Invoice = {
      ...rawInvoice,
      customer_id: rawInvoice.customer_id || 'temp-id',
      status: rawInvoice.status as 'Pending' | 'Paid' | 'Cancelled' || 'Pending'
    };
    
    // Generate the PDF with AI-enhanced content
    let pdfBuffer: any; // Using 'any' type to accommodate both Buffer and ReadableStream
    
    try {
      // Generate an AI-powered description for the invoice
      const vehicleDetails = invoice.vehicles.map(v => 
        `${v.year} ${v.make} ${v.model}, color: ${v.color}, price: $${v.price.toLocaleString()}`
      ).join('; ');
      
      const saleDescription = await generateInvoiceDescription({
        customer: customer.full_name,
        vehicles: vehicleDetails,
        total: invoice.total,
        date: new Date(invoice.created_at || '').toLocaleDateString()
      });
      
      // Add the AI-generated description to the invoice object
      const enhancedInvoice = {
        ...invoice,
        aiDescription: saleDescription
      };
      
      // Generate PDF buffer using the enhanced invoice
      pdfBuffer = await generatePDF(enhancedInvoice as Invoice, customer);
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Fallback to regular PDF without AI enhancement
      pdfBuffer = await generatePDF(invoice, customer);
    }
    
    // Return the PDF as a file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
