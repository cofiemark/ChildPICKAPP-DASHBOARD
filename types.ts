// FIX: Converted XML type definitions to TypeScript enums and interfaces.
export enum Role {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  TEACHER = "Teacher",
  STAFF = "Staff",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  grade?: number;
  avatarUrl?: string;
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
  notes?: string;
  authorizedGuardians: Guardian[];
}

export enum AttendanceStatus {
  PRESENT = "Present",
  ABSENT = "Absent",
  CHECKED_OUT = "Checked Out",
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

export interface AuditLog {
  id: string;
  timestamp: Date;
  user: { id: string; name: string; };
  action: string;
  details: string;
}
