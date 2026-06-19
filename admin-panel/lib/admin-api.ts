import { adminFetch } from './api-client';

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin';
};

type AdminLoginResponse = {
  admin: AdminUser;
  accessToken: string;
};

export type AdminStats = {
  registeredUsers: number;
  demoUsers: number;
  groups: number;
  chats: number;
  totalHabits: number;
};

export type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
};

export function adminLogin(email: string, password: string) {
  return adminFetch<AdminLoginResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function adminMe() {
  return adminFetch<{ admin: AdminUser }>('/admin/me');
}

export function getAdminStats() {
  return adminFetch<AdminStats>('/admin/stats');
}

export function getRegisteredUsers() {
  return adminFetch<RegisteredUser[]>('/admin/users');
}

export function getDemoUsers() {
  return adminFetch<
    { id: number; name: string; email: string; groups: unknown[] }[]
  >('/admin/demo-users');
}

export function getAdminGroups() {
  return adminFetch<
    { id: string; name: string; description: string; memberCount: number; habits: unknown[] }[]
  >('/admin/groups');
}
