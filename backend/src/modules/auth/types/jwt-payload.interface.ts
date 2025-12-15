export interface JwtPayload {
  sub: string;
  email?: string;
  role: 'user' | 'publisher' | 'admin' | 'guest';
  guest?: boolean;
}


