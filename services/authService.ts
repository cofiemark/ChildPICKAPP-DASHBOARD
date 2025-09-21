import { User, Role } from '../types';

// In a real application, this user data would be in a secure database.
const mockUsers: User[] = [
  { id: 'user1', name: 'Dr. Evelyn Reed', email: 'admin@school.edu', password: 'password123', role: Role.SUPER_ADMIN },
  { id: 'user2', name: 'Samuel Green', email: 'staff@school.edu', password: 'password123', role: Role.ADMIN_STAFF },
  { id: 'user3', name: 'Ms. Alice Johnson', email: 'teacher.alice@school.edu', password: 'password123', role: Role.TEACHER, grade: 5 },
  { id: 'user4', name: 'Mr. David Chen', email: 'teacher.david@school.edu', password: 'password123', role: Role.TEACHER, grade: 3 },
];

// --- Mock Authentication Logic ---

/**
 * Simulates a login API call with email and password.
 * Returns a user object and a fake JWT on success.
 */
export const login = (email: string, password: string): Promise<{ user: User; token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
        // In a real app, the server would generate a JWT.
        // We are creating a simple base64 encoded token for simulation.
        const token = btoa(JSON.stringify({ userId: user.id, role: user.role }));
        const { password, ...userWithoutPassword } = user;
        resolve({ user: userWithoutPassword as User, token });
      } else {
        reject(new Error('Invalid email or password.'));
      }
    }, 1000); // Simulate network delay
  });
};

/**
 * Simulates an SSO login flow.
 */
export const loginWithSSO = (provider: 'google' | 'microsoft'): Promise<{ user: User; token: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demonstration, we'll just log in the Super Admin for SSO.
            const user = mockUsers[0];
            const token = btoa(JSON.stringify({ userId: user.id, role: user.role, sso: provider }));
            const { password, ...userWithoutPassword } = user;
            resolve({ user: userWithoutPassword as User, token });
        }, 1200);
    });
};

/**
 * Simulates verifying a token and retrieving the user.
 * In a real app, you'd send the token to a `/me` or `/verify` endpoint.
 */
export const getUserFromToken = (token: string): User | null => {
  try {
    const decodedPayload = JSON.parse(atob(token));
    const user = mockUsers.find(u => u.id === decodedPayload.userId);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }
    return null;
  } catch (error) {
    console.error("Token decoding failed", error);
    return null;
  }
};


/**
 * Clears the authentication token from storage.
 */
export const logout = (): void => {
  localStorage.removeItem('authToken');
};
