import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/components/InvoicePDF';
import { Invoice, Customer } from '@/types';
import { generateInvoiceDescription } from '@/lib/openai';

export const dynamic = 'force-dynamic';

/**
 * API route to generate PDF invoices
 */
export async function POST(req: NextRequest) {
  try {
    // Get invoice and customer data from request body
    const requestData = await req.json();
    const { invoice: rawInvoice, customer } = requestData;
    
    if (!rawInvoice || !customer) {
      return NextResponse.json(
        { error: 'Invoice and customer data are required' },
        { status: 400 }
      );
    }
    
    // Ensure invoice object conforms to the Invoice type with required fields
    const invoice = {
      ...rawInvoice,
      customer_id: rawInvoice.customer_id || 'temp-id',
      status: rawInvoice.status || 'Pending'
    };
    
    // Generate the PDF with AI-enhanced content
    let pdfBuffer;
    
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
      pdfBuffer = await generatePDF(enhancedInvoice, customer);
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Fallback to regular PDF without AI enhancement
      pdfBuffer = await generatePDF(invoice, customer);
    }
    
    // Ensure buffer is properly formatted
    const responseBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    
    // Return the PDF as a file with proper PDF headers
    return new NextResponse(responseBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
        'Content-Length': String(responseBuffer.byteLength),
        'Cache-Control': 'no-cache',
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
