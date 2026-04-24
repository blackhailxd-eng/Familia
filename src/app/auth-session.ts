import { AuthUser } from './auth-user';

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: AuthUser;
}
