import { SafeUser } from '../../users/services/users.service';

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  guest?: boolean;
}

export interface AuthResponse {
  user: SafeUser | null;
  tokens: TokenBundle;
  otpRequired?: boolean;
}


