import { apiFetch, apiUpload } from './api-client';

export type AuthUserResponse = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUserResponse;
  accessToken: string;
};

type MeResponse = {
  user: AuthUserResponse;
};

type MessageResponse = {
  message: string;
  resetUrl?: string;
};

export async function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  email: string,
  password: string,
  name: string,
) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function forgotPasswordRequest(email: string) {
  return apiFetch<MessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordRequest(token: string, password: string) {
  return apiFetch<MessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function meRequest() {
  return apiFetch<MeResponse>('/auth/me');
}

export async function updateProfileRequest(name: string) {
  return apiFetch<MeResponse>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function uploadAvatarRequest(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<MeResponse>('/auth/avatar', formData);
}
