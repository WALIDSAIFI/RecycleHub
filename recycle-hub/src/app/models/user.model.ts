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
  profileImage?: string | null;
  role: 'USER' | 'ADMIN'; // ou d'autres rôles selon vos besoins
  points?: number;
} 