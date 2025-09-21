import { User, Role } from '../types';

const mockUsers: User[] = [
  { id: 'u1', name: 'Osei Kofi', email: 'osei.kofi@school.edu', role: Role.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Aisha Khan', email: 'aisha.khan@school.edu', role: Role.TEACHER, grade: 1, avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Ben Carter', email: 'ben.carter@school.edu', role: Role.TEACHER, grade: 2, avatarUrl: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Carla Diaz', email: 'carla.diaz@school.edu', role: Role.STAFF, avatarUrl: 'https://i.pravatar.cc/150?u=u4' },
];

interface AuthResponse {
  user: User;
  token: string;
}

const mockLogin = (email: string): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        const token = `mock-auth-token-${Date.now()}`;
        resolve({ user, token });
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 1000);
  });
};

export const login = (email: string, password?: string): Promise<AuthResponse> => {
  console.log(`Attempting login for ${email} with password ${password ? 'provided' : 'not provided'}`);
  return mockLogin(email);
};

export const loginWithSSO = (provider: 'google' | 'microsoft'): Promise<AuthResponse> => {
    console.log(`Attempting SSO login with ${provider}`);
    // For demo, we'll just log in the admin user for any SSO attempt.
    return mockLogin('osei.kofi@school.edu');
};
