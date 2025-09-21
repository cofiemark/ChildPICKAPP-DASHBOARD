// FIX: Removed circular import of AttendanceStatus from itself.
export enum Role {
    SUPER_ADMIN = 'Super Admin',
    ADMIN_STAFF = 'Admin Staff',
    TEACHER = 'Teacher',
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should not be exposed to the client in a real app
    role: Role;
    grade?: number; // Only for teachers
}

export interface Guardian {
    id: string;
    name: string;
    phone: string;
}

export interface Student {
    id: string;
    name: string;
    grade: number;
    authorizedGuardians: Guardian[];
    photoUrl?: string;
    notes?: string;
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    CHECKED_OUT = 'Checked Out',
    ABSENT = 'Absent',
}

export interface AttendanceRecord {
    id: string;
    student: Student;
    date: Date;
    status: AttendanceStatus;
    checkInTime: Date | null;
    checkOutTime: Date | null;
    checkInGuardian: Guardian | null;
    checkOutGuardian: Guardian | null;
}

export type AppView = 'dashboard' | 'students' | 'reports' | 'settings' | 'user_management';