import { AttendanceRecord, Student, Guardian, AttendanceStatus } from '../types';

// --- MOCK DATA ---

const mockGuardians: Guardian[] = [
  { id: 'g01', name: 'Ama Osei', phone: '555-0101' },
  { id: 'g02', name: 'Kofi Mensah', phone: '555-0102' },
  { id: 'g03', name: 'Yaa Addo', phone: '555-0103' },
  { id: 'g04', name: 'Kwabena Boateng', phone: '555-0104' },
  { id: 'g05', name: 'Akua Asante', phone: '555-0105' },
  { id: 'g06', name: 'Yaw Nkrumah', phone: '555-0106' },
  { id: 'g07', name: 'Adwoa Acheampong', phone: '555-0107' },
  { id: 'g08', name: 'Kwaku Owusu', phone: '555-0108' },
  { id: 'g09', name: 'Afia Annan', phone: '555-0109' },
  { id: 'g10', name: 'Kojo Agyemang', phone: '555-0110' },
  { id: 'g11', name: 'Amma Boateng', phone: '555-0111' },
  { id: 'g12', name: 'Kwadwo Mensah', phone: '555-0112' },
];

let mockStudents: Student[] = [
  { id: 'S001', name: 'Kwaku Osei', grade: 3, authorizedGuardians: [mockGuardians[0], mockGuardians[1]], photoUrl: `https://i.pravatar.cc/150?u=S001` },
  { id: 'S002', name: 'Abena Mensah', grade: 3, authorizedGuardians: [mockGuardians[1]], photoUrl: `https://i.pravatar.cc/150?u=S002` },
  { id: 'S003', name: 'Yaw Addo Jr.', grade: 3, authorizedGuardians: [mockGuardians[2], mockGuardians[3]], photoUrl: `https://i.pravatar.cc/150?u=S003` },
  { id: 'S004', name: 'Akosua Boateng', grade: 5, authorizedGuardians: [mockGuardians[3]], photoUrl: `https://i.pravatar.cc/150?u=S004` },
  { id: 'S005', name: 'Kofi Asante', grade: 5, authorizedGuardians: [mockGuardians[4]], notes: "Allergy to peanuts." },
  { id: 'S006', name: 'Afia Nkrumah', grade: 5, authorizedGuardians: [mockGuardians[5], mockGuardians[0]], photoUrl: `https://i.pravatar.cc/150?u=S006` },
  { id: 'S007', name: 'Kwadwo Acheampong', grade: 3, authorizedGuardians: [mockGuardians[6]], photoUrl: `https://i.pravatar.cc/150?u=S007` },
  { id: 'S008', name: 'Amma Owusu', grade: 5, authorizedGuardians: [mockGuardians[7]], photoUrl: `https://i.pravatar.cc/150?u=S008` },
];

let mockAttendanceRecords: AttendanceRecord[] = [];

const generateMockData = () => {
    if (mockAttendanceRecords.length > 0) return; // Generate only once
    const today = new Date();
    mockAttendanceRecords = [];

    for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() - day);
        date.setHours(0,0,0,0);

        mockStudents.forEach((student, index) => {
            const chance = Math.random();
            let status: AttendanceStatus, checkInTime: Date | null = null, checkOutTime: Date | null = null;
            let checkInGuardian: Guardian | null = null, checkOutGuardian: Guardian | null = null;
            
            if (chance < 0.85) { // Present or Checked Out
                status = AttendanceStatus.PRESENT;
                const checkInHour = 8 + Math.random() * 2.5; // 8:00 AM - 10:30 AM to generate late check-ins
                checkInTime = new Date(date);
                checkInTime.setHours(checkInHour, Math.random() * 60);
                checkInGuardian = student.authorizedGuardians[0];

                if (chance < 0.5) { // Checked out
                    status = AttendanceStatus.CHECKED_OUT;
                    const checkOutHour = 14 + Math.random() * 4; // 2:00 PM - 6:00 PM to generate late departures
                    checkOutTime = new Date(date);
                    checkOutTime.setHours(checkOutHour, Math.random() * 60);
                    checkOutGuardian = student.authorizedGuardians[Math.floor(Math.random() * student.authorizedGuardians.length)];
                }
            } else { // Absent
                status = AttendanceStatus.ABSENT;
            }

            // For today, some might still be just present
            if (day === 0 && status === AttendanceStatus.CHECKED_OUT && Math.random() > 0.6) {
                status = AttendanceStatus.PRESENT;
                checkOutTime = null;
                checkOutGuardian = null;
            }

            mockAttendanceRecords.push({
                id: `rec-${day}-${student.id}`,
                student,
                date,
                status,
                checkInTime,
                checkOutTime,
                checkInGuardian,
                checkOutGuardian
            });
        })
    }
};

generateMockData();

// --- API Functions ---

const simulateDelay = <T>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300));

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
    const recordsWithDateStrings = await simulateDelay(mockAttendanceRecords);
    
    // The JSON stringify/parse process converts Date objects to ISO date strings.
    // We need to re-hydrate them back into Date objects before they are used in the app.
    return recordsWithDateStrings.map(record => ({
        ...record,
        date: new Date(record.date),
        checkInTime: record.checkInTime ? new Date(record.checkInTime) : null,
        checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : null,
    }));
};

export const getStudents = async (): Promise<Student[]> => {
    return simulateDelay(mockStudents);
};

export const getStudentById = (studentId: string): Student | undefined => {
  return mockStudents.find(s => s.id.toLowerCase() === studentId.toLowerCase());
};

export const updateAttendance = async (studentId: string, guardianName: string, action: 'check-in' | 'check-out'): Promise<AttendanceRecord> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const student = getStudentById(studentId);
            if (!student) {
                return reject(new Error('Student ID not found.'));
            }

            const todayStr = new Date().toDateString();
            let record = mockAttendanceRecords.find(r => r.student.id === student.id && r.date.toDateString() === todayStr);

            if (!record) {
                record = {
                    id: `rec-manual-${Date.now()}`,
                    student,
                    date: new Date(),
                    status: AttendanceStatus.ABSENT,
                    checkInTime: null,
                    checkOutTime: null,
                    checkInGuardian: null,
                    checkOutGuardian: null,
                };
                mockAttendanceRecords.unshift(record);
            }
            
            const guardian: Guardian = { id: `g-manual-${Date.now()}`, name: guardianName, phone: 'N/A' };

            if (action === 'check-in') {
                if (record.status !== AttendanceStatus.ABSENT) {
                    return reject(new Error('Student is already present or checked out.'));
                }
                record.status = AttendanceStatus.PRESENT;
                record.checkInTime = new Date();
                record.checkInGuardian = guardian;
            } else { // check-out
                if (record.status === AttendanceStatus.ABSENT) {
                    return reject(new Error('Cannot check out an absent student.'));
                }
                if (record.status === AttendanceStatus.CHECKED_OUT) {
                    return reject(new Error('Student has already been checked out.'));
                }
                record.status = AttendanceStatus.CHECKED_OUT;
                record.checkOutTime = new Date();
                record.checkOutGuardian = guardian;
            }
            
            resolve(JSON.parse(JSON.stringify(record)));
        }, 500);
    });
};

export const addStudent = async (studentData: Omit<Student, 'id'>): Promise<Student> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newIdNumber = Math.max(...mockStudents.map(s => parseInt(s.id.substring(1), 10))) + 1;
            const newStudent: Student = {
                id: `S${String(newIdNumber).padStart(3, '0')}`,
                ...studentData
            };
            mockStudents.push(newStudent);
            
            // Create a default absent record for today
            mockAttendanceRecords.unshift({
                id: `rec-new-${Date.now()}`,
                student: newStudent,
                date: new Date(),
                status: AttendanceStatus.ABSENT,
                checkInTime: null, checkOutTime: null,
                checkInGuardian: null, checkOutGuardian: null
            });

            resolve(JSON.parse(JSON.stringify(newStudent)));
        }, 500);
    });
};

export const updateStudent = async (studentId: string, studentData: Partial<Student>): Promise<Student> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const studentIndex = mockStudents.findIndex(s => s.id === studentId);
            if (studentIndex === -1) {
                return reject(new Error('Student not found.'));
            }
            mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...studentData };
            
            // Also update student info in all records
            mockAttendanceRecords.forEach(rec => {
                if (rec.student.id === studentId) {
                    rec.student = mockStudents[studentIndex];
                }
            });

            resolve(JSON.parse(JSON.stringify(mockStudents[studentIndex])));
        }, 500);
    });
};