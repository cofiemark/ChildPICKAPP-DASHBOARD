import { AuditLog, User } from '../types';

const mockUsers: Pick<User, 'id' | 'name'>[] = [
    { id: 'u1', name: 'Osei Kofi' },
    { id: 'u2', name: 'Aisha Khan' },
    { id: 'u3', name: 'Ben Carter' },
    { id: 'u4', name: 'Carla Diaz' },
];

const mockActions = [
    'User Login',
    'Manual Check-in',
    'Manual Check-out',
    'Report Generated',
    'Student Record Updated',
    'User Profile Edited',
    'System Settings Changed',
    'Student Record Deleted',
];

const generateMockLogs = (count: number): AuditLog[] => {
    const logs: AuditLog[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const timestamp = new Date(now.getTime() - i * 1000 * 60 * (Math.random() * 60 + 5)); // 5-65 mins ago
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const action = mockActions[Math.floor(Math.random() * mockActions.length)];
        
        logs.push({
            id: `log-${Date.now()}-${i}`,
            timestamp,
            user,
            action,
            details: `User ${user.name} performed action: ${action}.`,
        });
    }

    return logs;
};

const auditLogs: AuditLog[] = generateMockLogs(50);

const mockApi = <T>(data: T, delay = 300): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

export const getAuditLogs = (): Promise<AuditLog[]> => {
    return mockApi(auditLogs).then((serializedLogs: any[]) => {
        return serializedLogs.map(log => ({
            ...log,
            timestamp: new Date(log.timestamp),
        }));
    });
};