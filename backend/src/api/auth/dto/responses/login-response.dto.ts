export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role?: string | null;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string | null;
  user: AuthenticatedUser;
}
