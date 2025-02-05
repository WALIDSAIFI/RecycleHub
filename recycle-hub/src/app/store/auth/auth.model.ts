export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  points?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  birthDate?: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 