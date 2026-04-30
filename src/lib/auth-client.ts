export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
  mustChangePassword: boolean;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setUserOnly(user: User): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('user', JSON.stringify(user));
  // Set a session cookie for middleware
  document.cookie = `session=${user.id}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('user');
  // Remove the session cookie
  document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'ADMIN';
}

export function isTreasurer(): boolean {
  const user = getUser();
  return user?.role === 'TREASURER';
}

export function isSecretary(): boolean {
  const user = getUser();
  return user?.role === 'SECRETARY';
}

export function isMember(): boolean {
  const user = getUser();
  return user?.role === 'MEMBER';
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin-panel';
    case 'TREASURER':
      return '/treasurer-dashboard';
    case 'SECRETARY':
      return '/secretary-dashboard';
    case 'MEMBER':
      return '/member-dashboard';
    default:
      return '/login-screen';
  }
}