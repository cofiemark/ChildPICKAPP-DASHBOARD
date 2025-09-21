export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  CHECKED_OUT = 'Checked Out',
}

export enum Role {
  SUPER_ADMIN = 'Super Admin',
  ADMIN_STAFF = 'Admin Staff',
  TEACHER = 'Teacher',
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
  photoUrl?: string;
  authorizedGuardians: Guardian[];
  notes?: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  grade?: number; // For teachers
}

export type AppView = 'dashboard' | 'students' | 'reports' | 'settings';
