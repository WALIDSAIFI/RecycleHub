export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  birthDate: string;
  profileImage?: string;
  role: 'particular' | 'collector';
  points?: number;
} 