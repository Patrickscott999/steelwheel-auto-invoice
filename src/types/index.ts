export interface Customer {
  id?: string;
  full_name: string;
  trn: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: string;
  vin: string;
  color: string;
  mileage: string;
  price: number;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  customer_id: string;
  customer?: Customer;
  vehicles: Vehicle[];
  subtotal: number;
  gct: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  created_at?: string;
}

export type User = {
  email: string;
}
