import { AttendanceRecord, Student, User, Guardian, AttendanceStatus, Role } from '../types';

// --- MOCK DATA ---
const guardians: Guardian[] = [
  { id: 'g1', name: 'John Doe', phone: '555-1111' },
  { id: 'g2', name: 'Jane Doe', phone: '555-1112' },
  { id: 'g3', name: 'Peter Jones', phone: '555-2221' },
  { id: 'g4', name: 'Mary Jones', phone: '555-2222' },
  { id: 'g5', name: 'David Smith', phone: '555-3331' },
  { id: 'g6', name: 'Sarah Smith', phone: '555-3332' },
  { id: 'g7', name: 'Mike Williams', phone: '555-4441' },
  { id: 'g8', name: 'Lisa Williams', phone: '555-4442' },
];

let students: Student[] = [
  { id: '1000000001', name: 'Alice Doe', grade: 1, authorizedGuardians: [guardians[0], guardians[1]], photoUrl: 'https://i.pravatar.cc/150?u=1000000001', notes: 'Allergic to peanuts.' },
  { id: '1000000002', name: 'Bob Jones', grade: 1, authorizedGuardians: [guardians[2], guardians[3]], photoUrl: 'https://i.pravatar.cc/150?u=1000000002' },
  { id: '1000000003', name: 'Charlie Smith', grade: 2, authorizedGuardians: [guardians[4], guardians[5]], photoUrl: 'https://i.pravatar.cc/150?u=1000000003' },
  { id: '1000000004', name: 'Diana Williams', grade: 2, authorizedGuardians: [guardians[6], guardians[7]], photoUrl: 'https://i.pravatar.cc/150?u=1000000004', notes: 'Needs to take medication at noon.' },
  { id: '1000000005', name: 'Ethan Brown', grade: 1, authorizedGuardians: [{id: 'g9', name: 'Emily Brown', phone: '555-5555'}], photoUrl: 'https://i.pravatar.cc/150?u=1000000005' },
];

let users: User[] = [
    { id: 'u0', name: 'Yaw Admin', email: 'yaw.admin@school.edu', role: Role.SUPER_ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=u0' },
    { id: 'u1', name: 'Osei Kofi', email: 'osei.kofi@school.edu', role: Role.ADMIN, avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
    { id: 'u2', name: 'Aisha Khan', email: 'aisha.khan@school.edu', role: Role.TEACHER, grade: 1, avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
    { id: 'u3', name: 'Ben Carter', email: 'ben.carter@school.edu', role: Role.TEACHER, grade: 2, avatarUrl: 'https://i.pravatar.cc/150?u=u3' },
    { id: 'u4', name: 'Carla Diaz', email: 'carla.diaz@school.edu', role: Role.STAFF, avatarUrl: 'https://i.pravatar.cc/150?u=u4' },
];

const randomTime = (date: Date, startHour: number, endHour: number) => {
  const d = new Date(date);
  const hour = startHour + Math.random() * (endHour - startHour);
  const minute = Math.random() * 60;
  d.setHours(hour, minute);
  return d;
};

const generateMockRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    students.forEach((student, index) => {
      const roll = Math.random();
      let status: AttendanceStatus;
      let checkInTime: Date | null = null;
      let checkOutTime: Date | null = null;
      let checkInGuardian: Guardian | null = null;
      let checkOutGuardian: Guardian | null = null;
      
      if (roll < 0.85) { // Present or Checked Out
        status = AttendanceStatus.PRESENT;
        checkInTime = randomTime(date, 8, 10);
        checkInGuardian = student.authorizedGuardians[0];
        
        if (roll < 0.4) { // Checked out
            status = AttendanceStatus.CHECKED_OUT;
            checkOutTime = randomTime(date, 15, 17);
            checkOutGuardian = student.authorizedGuardians[Math.floor(Math.random() * student.authorizedGuardians.length)];
        }

      } else { // Absent
        status = AttendanceStatus.ABSENT;
      }

      records.push({
        id: `rec-${i}-${student.id}`,
        student,
        date,
        status,
        checkInTime,
        checkOutTime,
        checkInGuardian,
        checkOutGuardian,
      });
    });
  }
  return records;
};

let attendanceRecords: AttendanceRecord[] = generateMockRecords();

const mockApi = <T>(data: T, delay = 500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));


// --- API Functions ---

export const getAttendanceRecords = (startDate: Date, endDate: Date): Promise<AttendanceRecord[]> => {
    // Simulate API call which returns serialized data, then rehydrate
    return mockApi(attendanceRecords).then((serializedRecords: any[]) => {
        const filtered = serializedRecords.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= startDate && recordDate <= endDate;
        });

        return filtered.map(r => ({
            ...r,
            date: new Date(r.date),
            checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
            checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
        }));
    });
};

export const getStudents = (): Promise<Student[]> => mockApi(students);

export const getUsers = (): Promise<User[]> => mockApi(users);

export const manualCheckInCheckOut = (studentId: string, guardianName: string, action: 'check-in' | 'check-out'): Promise<void> => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const student = students.find(s => s.id === studentId);
    if (!student) return Promise.reject(new Error('Student not found'));

    let guardian = student.authorizedGuardians.find(g => g.name.toLowerCase() === guardianName.toLowerCase());
    if (!guardian) {
        guardian = { id: `g-temp-${Date.now()}`, name: guardianName, phone: 'N/A' };
    }
    
    let record = attendanceRecords.find(r => r.student.id === studentId && new Date(r.date).getTime() === today.getTime());

    if (record) { // Update existing record
        if (action === 'check-in') {
            record.checkInTime = new Date();
            record.checkInGuardian = guardian;
            record.status = AttendanceStatus.PRESENT;
        } else {
            record.checkOutTime = new Date();
            record.checkOutGuardian = guardian;
            record.status = AttendanceStatus.CHECKED_OUT;
        }
    } else { // Create new record
        record = {
            id: `rec-manual-${Date.now()}`,
            student,
            date: today,
            status: action === 'check-in' ? AttendanceStatus.PRESENT : AttendanceStatus.CHECKED_OUT,
            checkInTime: action === 'check-in' ? new Date() : null,
            checkOutTime: action === 'check-out' ? new Date() : null,
            checkInGuardian: action === 'check-in' ? guardian : null,
            checkOutGuardian: action === 'check-out' ? guardian : null,
        };
        attendanceRecords.unshift(record);
    }
    return mockApi(undefined);
};

export const saveStudent = (studentData: Omit<Student, 'id'> | Student): Promise<Student> => {
    if ('id' in studentData) { // Update
        const index = students.findIndex(s => s.id === studentData.id);
        if (index > -1) {
            students[index] = studentData;
            return mockApi(students[index]);
        }
        return Promise.reject(new Error('Student not found for update.'));
    } else { // Create
        const newStudent: Student = {
            ...studentData,
            id: String(Math.floor(Math.random() * 1000000000) + 1000000000),
        };
        students.push(newStudent);
        return mockApi(newStudent);
    }
};

export const deleteStudent = (studentId: string): Promise<void> => {
    students = students.filter(s => s.id !== studentId);
    attendanceRecords = attendanceRecords.filter(r => r.student.id !== studentId);
    return mockApi(undefined);
};

export const saveUser = (userData: Omit<User, 'id'> | User): Promise<User> => {
    if ('id' in userData) { // Update
        const index = users.findIndex(u => u.id === userData.id);
        if (index > -1) {
            users[index] = { ...users[index], ...userData };
            return mockApi(users[index]);
        }
        return Promise.reject(new Error('User not found for update.'));
    } else { // Create
        const newUser: User = {
            ...userData,
            id: `u${Date.now()}`,
        };
        users.push(newUser);
        return mockApi(newUser);
    }
};

export const deleteUser = (userId: string): Promise<void> => {
    users = users.filter(u => u.id !== userId);
    return mockApi(undefined);
};