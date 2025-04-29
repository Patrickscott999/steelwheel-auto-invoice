import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { Invoice, Customer, Vehicle } from '@/types';

// Use standard fonts that are more compatible with PDF viewers like Preview
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ]
});

Font.register({
  family: 'Times-Roman',
  fonts: [
    { src: 'Times-Roman' },
    { src: 'Times-Bold', fontWeight: 'bold' },
  ]
});

// Create styles with standard fonts for better compatibility
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#0A1128',
    color: 'white',
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3AB0FF',
  },
  customerInfo: {
    marginBottom: 10,
  },
  vehicleTable: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 24,
    alignItems: 'center',
  },
  tableHeaderCell: {
    width: '14.28%',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    width: '14.28%',
    fontSize: 10,
    padding: 5,
  },
  totals: {
    marginTop: 10,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 12,
  },
  grandTotalValue: {
    fontSize: 14,
    color: '#00FFAB',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface InvoicePDFProps {
  invoice: Invoice & { aiDescription?: string };
  customer: Customer;
}

const InvoicePDF = ({ invoice, customer }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SteelWheel Auto</Text>
        <View style={styles.invoiceDetails}>
          <Text>Invoice #: {invoice.invoice_number}</Text>
          <Text>Date: {new Date(invoice.created_at || '').toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.customerInfo}>
          <Text>Name: {customer.full_name}</Text>
          <Text>TRN: {customer.trn}</Text>
          <Text>Address: {customer.address}</Text>
          <Text>Phone: {customer.phone}</Text>
          <Text>Email: {customer.email}</Text>
        </View>
      </View>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <View style={styles.vehicleTable}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>Make</Text>
            <Text style={styles.tableHeaderCell}>Model</Text>
            <Text style={styles.tableHeaderCell}>Year</Text>
            <Text style={styles.tableHeaderCell}>VIN</Text>
            <Text style={styles.tableHeaderCell}>Color</Text>
            <Text style={styles.tableHeaderCell}>Mileage</Text>
            <Text style={styles.tableHeaderCell}>Price (JMD)</Text>
          </View>
          
          {/* Table Body */}
          {invoice.vehicles.map((vehicle: Vehicle, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{vehicle.make}</Text>
              <Text style={styles.tableCell}>{vehicle.model}</Text>
              <Text style={styles.tableCell}>{vehicle.year}</Text>
              <Text style={styles.tableCell}>{vehicle.vin}</Text>
              <Text style={styles.tableCell}>{vehicle.color}</Text>
              <Text style={styles.tableCell}>{vehicle.mileage}</Text>
              <Text style={styles.tableCell}>${vehicle.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>
        
        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>JMD ${invoice.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GCT (15%):</Text>
            <Text style={styles.totalValue}>JMD ${invoice.gct.toLocaleString()}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.totalLabel}>Total Due:</Text>
            <Text style={styles.grandTotalValue}>JMD ${invoice.total.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      {invoice.aiDescription && (
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>AI-Generated Note</Text>
          <Text style={{ fontSize: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{invoice.aiDescription}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text>Thank you for choosing SteelWheel Auto. For any inquiries, please contact us.</Text>
      </View>
    </Page>
  </Document>
);

export async function generatePDF(invoice: Invoice, customer: Customer) {
  // Create a renderer with specific PDF version for better compatibility
  const pdfDocument = await pdf(
    <InvoicePDF invoice={invoice} customer={customer} />
  ).toBuffer();
  
  // Return the PDF buffer
  return pdfDocument;
}

export default InvoicePDF;
