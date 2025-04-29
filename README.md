# SteelWheel Auto Invoice Generator

A modern, responsive web application for car dealership invoice management with a galaxy-themed UI and Supabase integration.

![SteelWheel Auto Invoice Generator](https://i.imgur.com/placeholder.png)

## Features

- **🔐 Secure Authentication**
  - Restricted access for CEO only (email: ceo@dealership.com)
  - Auto-logout for unauthorized users
  - Secure session management with Supabase Auth

- **🌌 Galaxy-Themed UI**
  - Dark space background with animated stars
  - Electric blue and neon green accent colors
  - Custom font pairing (Orbitron for headers, Poppins for body text)
  - Smooth animations and transitions
  - Fully responsive design for all devices

- **🧾 Comprehensive Invoice Management**
  - Create detailed invoices with customer information
  - Add multiple vehicles to a single invoice
  - Automatic calculation of subtotal, GCT (15%), and grand total
  - Dynamic invoice number generation based on date
  - PDF generation and download
  - Email invoice capability

- **📁 Data Management with Supabase**
  - Customer data storage and retrieval
  - Invoice history with search functionality
  - View, reprint, and resend past invoices

## Technologies Used

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database)
- **PDF Generation**: React-PDF
- **Forms**: React Hook Form
- **Notifications**: React-Toastify

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/steelwheel-invoice-generator.git
cd steelwheel-invoice-generator
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables in Supabase:

#### Customers Table
```sql
create table customers (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  trn text not null,
  address text not null,
  phone text not null,
  email text not null unique,
  created_at timestamp with time zone default now()
);
```

#### Invoices Table
```sql
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  invoice_number text not null unique,
  customer_id uuid references customers(id),
  vehicles jsonb not null,
  subtotal numeric not null,
  gct numeric not null,
  total numeric not null,
  status text not null,
  created_at timestamp with time zone default now()
);
```

3. Create the CEO user through Supabase Authentication (email: ceo@dealership.com)

## Usage

1. Login with CEO credentials
2. You'll be redirected to the Invoice Creation page
3. Fill in customer details and add vehicle information
4. Save the invoice to generate a PDF
5. Download or email the invoice to the customer
6. View past invoices in the Past Invoices section

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [Supabase](https://supabase.io) - Open Source Firebase Alternative
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
