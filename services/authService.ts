import { User, Role } from '../types';

// In a real application, this user data would be in a secure database.
let mockUsers: User[] = [
  { id: 'user1', name: 'Dr. Esi Agyemang', email: 'agyemang.esi@school.edu', password: 'password123', role: Role.SUPER_ADMIN },
  { id: 'user2', name: 'Kwame Annan', email: 'annan.kwame@school.edu', password: 'password123', role: Role.ADMIN_STAFF },
  { id: 'user3', name: 'Mrs. Yaa Asante', email: 'asante.yaa@school.edu', password: 'password123', role: Role.TEACHER, grade: 5 },
  { id: 'user4', name: 'Mr. Kofi Osei', email: 'osei.kofi@school.edu', password: 'password123', role: Role.TEACHER, grade: 3 },
];

const simulateDelay = <T>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300));


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

// --- User Management CRUD ---

export const getUsers = async (): Promise<User[]> => {
    const users = await simulateDelay(mockUsers);
    return users.map(({ password, ...user }) => user as User);
};

export const addUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                return reject(new Error('A user with this email already exists.'));
            }
            const newUser: User = {
                id: `user${Date.now()}`,
                ...userData,
                password: userData.password || 'password123' // Set a default password
            };
            mockUsers.push(newUser);
            const { password, ...userWithoutPassword } = newUser;
            resolve(userWithoutPassword as User);
        }, 500);
    });
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
            const { password, ...userWithoutPassword } = mockUsers[userIndex];
            resolve(userWithoutPassword as User);
        }, 500);
    });
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            // Prevent deleting the last Super Admin
            const superAdmins = mockUsers.filter(u => u.role === Role.SUPER_ADMIN);
            if (mockUsers[userIndex].role === Role.SUPER_ADMIN && superAdmins.length === 1) {
                return reject(new Error('Cannot delete the last Super Admin.'));
            }
            mockUsers.splice(userIndex, 1);
            resolve({ success: true });
        }, 500);
    });
};