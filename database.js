import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CONFIG } from './config.js';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from './supabaseClient.js';
import { supabaseService } from './supabaseService.js';

// In-Memory Data Store for hackathon resilience & instant demo functionality
export const memoryStore = {
  isUsingMemory: true,
  users: [],
  incidents: [],
  queueServices: [],
  queueTokens: [],
  expenses: [],
  studyPlans: [],
  exams: [],
  studySessions: [],
  notifications: []
};

// Seed initial rich data so the dashboard is immediately functional
export async function seedInitialData() {
  const hashedPasswordStudent = await bcrypt.hash('student123', 10);
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);

  // 1. Initial Users (Diverse Student Roster for SRM University Delhi-NCR)
  memoryStore.users = [
    {
      _id: 'user-student-001',
      name: 'Lavishtushir',
      email: 'student@campus.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2023-CS0142',
      department: 'Computer Science & Engineering',
      year: '3rd Year (6th Sem)',
      hostel: 'Vivekananda Boys Residential Complex (SRM Rai)',
      roomNo: 'A-304',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      budget: 8000,
      createdAt: new Date()
    },
    {
      _id: 'user-student-002',
      name: 'Ananya Sharma',
      email: 'ananya.s@srm.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2024-AI0029',
      department: 'AI & Data Science',
      year: '2nd Year (4th Sem)',
      hostel: 'Kalpana Chawla Girls Residential Complex (SRM Rai)',
      roomNo: 'B-102',
      phone: '+91 98112 34567',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
      budget: 7500,
      createdAt: new Date(Date.now() - 30 * 86400 * 1000)
    },
    {
      _id: 'user-student-003',
      name: 'Rohit Verma',
      email: 'rohit.v@srm.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2022-ME0088',
      department: 'Mechanical & Automation Engineering',
      year: '4th Year (8th Sem)',
      hostel: 'Vivekananda Boys Residential Complex (SRM Rai)',
      roomNo: 'C-214',
      phone: '+91 98223 45678',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      budget: 9000,
      createdAt: new Date(Date.now() - 60 * 86400 * 1000)
    },
    {
      _id: 'user-student-004',
      name: 'Priya Iyer',
      email: 'priya.i@srm.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2023-LAW0055',
      department: 'Faculty of Law (BA LLB Hons)',
      year: '3rd Year (6th Sem)',
      hostel: 'Kalpana Chawla Girls Residential Complex (SRM Rai)',
      roomNo: 'A-205',
      phone: '+91 98334 56789',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      budget: 6500,
      createdAt: new Date(Date.now() - 45 * 86400 * 1000)
    },
    {
      _id: 'user-student-005',
      name: 'Aman Deep Singh',
      email: 'aman.d@srm.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2025-MBA0019',
      department: 'Faculty of Management (MBA)',
      year: '1st Year (2nd Sem)',
      hostel: 'Vivekananda Boys Residential Complex (SRM Rai)',
      roomNo: 'D-401',
      phone: '+91 98445 67890',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
      budget: 10000,
      createdAt: new Date(Date.now() - 15 * 86400 * 1000)
    },
    {
      _id: 'user-student-006',
      name: 'Sneha Patel',
      email: 'sneha.p@srm.edu',
      password: hashedPasswordStudent,
      role: 'student',
      studentId: 'SRM-2023-CS0189',
      department: 'Computer Science & Engineering',
      year: '3rd Year (6th Sem)',
      hostel: 'Kalpana Chawla Girls Residential Complex (SRM Rai)',
      roomNo: 'C-312',
      phone: '+91 98556 78901',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
      budget: 7000,
      createdAt: new Date(Date.now() - 20 * 86400 * 1000)
    },
    {
      _id: 'user-admin-001',
      name: 'Dr. Vikram Sharma',
      email: 'admin@campus.edu',
      password: hashedPasswordAdmin,
      role: 'admin',
      studentId: 'ADMIN-SRM-09',
      department: 'Campus Safety & Student Welfare (SRM Rai, Sonepat)',
      phone: '+91 98765 00001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date()
    }
  ];

  // 2. Initial Active Incidents (SRM University Rai, Sonepat)
  memoryStore.incidents = [
    {
      _id: 'inc-001',
      type: 'Lift Failure',
      title: 'Elevator Stuck Between 3rd & 4th Floor',
      description: 'North wing elevator halted with alarm beeping in Administrative & Academic Tower. 2 students currently inside.',
      building: 'Main Administrative & Academic Tower',
      floor: '3rd Floor North Wing',
      location: { lat: 28.9192, lng: 77.1285 },
      priority: 'Critical',
      status: 'In Progress',
      estimatedResponseTime: '5 minutes',
      suggestedResponder: 'Rapid Elevator Tech & SRM Security',
      reportersCount: 3,
      reporterNames: ['Lavishtushir', 'Rahul Verma', 'Sneha Patel'],
      reportedBy: 'user-student-001',
      photoUrl: 'https://images.unsplash.com/photo-1579208570378-8c970854bc23?auto=format&fit=crop&q=80&w=400',
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      _id: 'inc-002',
      type: 'Water Leakage',
      title: 'Water Pipe Burst Near Main Washrooms',
      description: 'Significant water overflow near ground floor rest area causing slippery hallway.',
      building: 'Faculty of Law & Moot Court Complex',
      floor: 'Ground Floor Restrooms',
      location: { lat: 28.9186, lng: 77.1278 },
      priority: 'Medium',
      status: 'Reported',
      estimatedResponseTime: '30 minutes',
      suggestedResponder: 'Campus Plumbing & Sanitation Crew',
      reportersCount: 1,
      reporterNames: ['Ankit Roy'],
      reportedBy: 'user-student-001',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400',
      createdAt: new Date(Date.now() - 50 * 60 * 1000)
    },
    {
      _id: 'inc-003',
      type: 'Broken Street Light',
      title: 'Pathway Lamp Post 14 Flickering & Dark',
      description: 'Dark stretch on pedestrian walkway between Vivekananda Boys Hostel and Central Dining Hall.',
      building: 'Vivekananda Boys Residential Complex',
      floor: 'Pedestrian Walkway',
      location: { lat: 28.9197, lng: 77.1305 },
      priority: 'Medium',
      status: 'Investigating',
      estimatedResponseTime: '45 minutes',
      suggestedResponder: 'Electrical Maintenance Team',
      reportersCount: 2,
      reporterNames: ['Lavishtushir', 'Manish G.'],
      reportedBy: 'user-student-001',
      photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400',
      createdAt: new Date(Date.now() - 90 * 60 * 1000)
    }
  ];

  // 3. Queue Services (SRM University Rai, Sonepat)
  memoryStore.queueServices = [
    {
      _id: 'qs-canteen',
      name: 'Campus Dining & Food Court Plaza',
      code: 'CAN',
      category: 'Canteen',
      location: 'Central Plaza Near Engineering Block',
      currentServingToken: 'CAN-140',
      totalIssuedToday: 146,
      averageWaitMinutes: 6,
      status: 'Open',
      peakHours: '12:30 PM - 2:00 PM',
      currentQueueCount: 6
    },
    {
      _id: 'qs-hospital',
      name: 'University Health Centre & Emergency Clinic',
      code: 'MED',
      category: 'Hospital',
      location: 'Ground Floor Health Care Wing',
      currentServingToken: 'MED-042',
      totalIssuedToday: 48,
      averageWaitMinutes: 8,
      status: 'Open',
      peakHours: '10:00 AM - 12:00 PM',
      currentQueueCount: 6
    },
    {
      _id: 'qs-library',
      name: 'Central Knowledge Resource & Digital Library',
      code: 'LIB',
      category: 'Library Help Desk',
      location: 'Central Library 1st Floor',
      currentServingToken: 'LIB-085',
      totalIssuedToday: 89,
      averageWaitMinutes: 3,
      status: 'Open',
      peakHours: '4:00 PM - 6:00 PM',
      currentQueueCount: 4
    },
    {
      _id: 'qs-student-office',
      name: 'Student Affairs & Placement Directorate',
      code: 'ADM',
      category: 'Student Office',
      location: 'Main Administrative Tower 1st Floor',
      currentServingToken: 'ADM-029',
      totalIssuedToday: 34,
      averageWaitMinutes: 10,
      status: 'Open',
      peakHours: '11:00 AM - 1:00 PM',
      currentQueueCount: 5
    },
    {
      _id: 'qs-cafeteria',
      name: 'Campus Beverage & Bakery Lounge',
      code: 'CAF',
      category: 'Cafeteria',
      location: 'Central Plaza Courtyard',
      currentServingToken: 'CAF-064',
      totalIssuedToday: 67,
      averageWaitMinutes: 5,
      status: 'Open',
      peakHours: '3:00 PM - 5:00 PM',
      currentQueueCount: 3
    },
    {
      _id: 'qs-printing',
      name: 'Academic Printing & Tech Reprographic Center',
      code: 'PRT',
      category: 'Printing Shop',
      location: 'Academic Tower Ground Floor Annex',
      currentServingToken: 'PRT-112',
      totalIssuedToday: 115,
      averageWaitMinutes: 4,
      status: 'Open',
      peakHours: '9:00 AM - 11:00 AM',
      currentQueueCount: 3
    }
  ];

  // 4. Sample active token for demo student
  memoryStore.queueTokens = [
    {
      _id: 'token-can-142',
      serviceId: 'qs-canteen',
      serviceName: 'Campus Dining & Food Court Plaza',
      tokenCode: 'CAN-142',
      userId: 'user-student-001',
      studentName: 'Lavishtushir',
      tokenCode: 'CAN-142',
      userId: 'user-student-001',
      studentName: 'Lavishtushir',
      peopleAhead: 2,
      timeSlot: 'Lunch Slot (1:00 PM - 1:30 PM)',
      partySize: 1,
      estimatedWaitMinutes: 6,
      status: 'Waiting',
      qrCodeData: 'CAMPUSCARE-TOKEN-CAN-142-user-student-001',
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    }
  ];

  // 5. Initial Expenses for student
  memoryStore.expenses = [
    {
      _id: 'exp-001',
      userId: 'user-student-001',
      amount: 450,
      category: 'Food',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      note: 'South Indian Combo & Fresh Juice at Central Canteen',
      createdAt: new Date(Date.now() - 1 * 86400000)
    },
    {
      _id: 'exp-002',
      userId: 'user-student-001',
      amount: 1250,
      category: 'Books',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      note: 'Operating System Concepts (Silberschatz) + Notebooks',
      createdAt: new Date(Date.now() - 3 * 86400000)
    },
    {
      _id: 'exp-003',
      userId: 'user-student-001',
      amount: 180,
      category: 'Transport',
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      note: 'Metro card top-up & campus shuttle',
      createdAt: new Date(Date.now() - 4 * 86400000)
    },
    {
      _id: 'exp-004',
      userId: 'user-student-001',
      amount: 320,
      category: 'Stationery',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      note: 'Lab manual spiral bindings and technical drawing pens',
      createdAt: new Date(Date.now() - 5 * 86400000)
    },
    {
      _id: 'exp-005',
      userId: 'user-student-001',
      amount: 650,
      category: 'Food',
      date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      note: 'Group pizza celebration after hackathon kickoff',
      createdAt: new Date(Date.now() - 6 * 86400000)
    },
    {
      _id: 'exp-006',
      userId: 'user-student-001',
      amount: 299,
      category: 'Recharge',
      date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      note: 'Monthly 5G Data Pack recharge',
      createdAt: new Date(Date.now() - 8 * 86400000)
    },
    {
      _id: 'exp-007',
      userId: 'user-student-001',
      amount: 500,
      category: 'Entertainment',
      date: new Date(Date.now() - 11 * 86400000).toISOString().split('T')[0],
      note: 'Weekend campus cinema club movie tickets',
      createdAt: new Date(Date.now() - 11 * 86400000)
    }
  ];

  // 6. Upcoming Exams
  memoryStore.exams = [
    {
      _id: 'exam-001',
      userId: 'user-student-001',
      subject: 'Data Structures & Algorithms',
      code: 'CS-301',
      date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM - 1:00 PM',
      venue: 'Exam Hall 3, Block A',
      priority: 'High',
      totalUnits: 5,
      completedUnits: 4
    },
    {
      _id: 'exam-002',
      userId: 'user-student-001',
      subject: 'Operating Systems & Kernels',
      code: 'CS-303',
      date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
      time: '02:00 PM - 5:00 PM',
      venue: 'Exam Hall 1, Block B',
      priority: 'High',
      totalUnits: 6,
      completedUnits: 3
    },
    {
      _id: 'exam-003',
      userId: 'user-student-001',
      subject: 'Database Management Systems',
      code: 'CS-305',
      date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      time: '10:00 AM - 1:00 PM',
      venue: 'Hall 2, Block A',
      priority: 'Medium',
      totalUnits: 5,
      completedUnits: 2
    }
  ];

  // 7. Study Plans & Weak Subject Predictions
  memoryStore.studyPlans = [
    {
      _id: 'plan-001',
      userId: 'user-student-001',
      date: new Date().toISOString().split('T')[0],
      streakDays: 7,
      focusScore: 88,
      dailyTasks: [
        { id: 't-1', time: '09:00 - 10:30', subject: 'Data Structures', topic: 'Dynamic Programming & Memoization', completed: true },
        { id: 't-2', time: '10:45 - 12:00', subject: 'Operating Systems', topic: 'Semaphore & Deadlock Avoidance (Banker Alg)', completed: true },
        { id: 't-3', time: '14:30 - 16:00', subject: 'Data Structures', topic: 'Graph Shortest Paths (Dijkstra / Bellman-Ford)', completed: false },
        { id: 't-4', time: '16:15 - 17:30', subject: 'DBMS', topic: 'B+ Tree Indexing & SQL Query Optimization', completed: false },
        { id: 't-5', time: '20:00 - 21:00', subject: 'Revision', topic: 'Spaced Repetition Flashcards Review', completed: false }
      ],
      weakSubjectAnalysis: {
        strongSubjects: ['Computer Networks', 'Object Oriented Programming', 'DBMS'],
        weakSubjects: ['Graph Algorithms', 'Process Synchronization', 'Fourier Transforms'],
        recommendedActions: [
          'Spend 30 minutes solving 2 Dijkstra graph problems today.',
          'Review Banker’s Algorithm deadlock state diagrams before tomorrow’s quiz.',
          'Practice time-complexity recurrence relations using Master Theorem.'
        ]
      },
      revisions: [
        { title: 'First Revision: Dynamic Programming', date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], status: 'Scheduled' },
        { title: 'Second Revision: Graph Algorithms', date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], status: 'Scheduled' },
        { title: 'Final Comprehensive Mock Test', date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'Scheduled' }
      ]
    }
  ];

  // 7.1 Initial Subject Study Sessions
  memoryStore.studySessions = [
    {
      _id: 'sess-001',
      userId: 'user-student-001',
      subject: 'Data Structures & Algorithms',
      topic: 'Dynamic Programming & Memoization',
      durationMinutes: 45,
      completedAt: new Date(Date.now() - 2 * 3600 * 1000)
    },
    {
      _id: 'sess-002',
      userId: 'user-student-001',
      subject: 'Operating Systems & Kernels',
      topic: 'Semaphore & Deadlock Avoidance',
      durationMinutes: 60,
      completedAt: new Date(Date.now() - 26 * 3600 * 1000)
    },
    {
      _id: 'sess-003',
      userId: 'user-student-001',
      subject: 'Database Management Systems',
      topic: 'B+ Tree Indexing & Query Plans',
      durationMinutes: 30,
      completedAt: new Date(Date.now() - 50 * 3600 * 1000)
    }
  ];

  // 8. Initial Notifications
  memoryStore.notifications = [
    {
      _id: 'notif-001',
      userId: 'user-student-001',
      type: 'Safety',
      title: 'Hazard Alert: Lift Issue in Block A',
      message: 'Technicians on site. Please use stairwells in Block A north corridor.',
      read: false,
      createdAt: new Date(Date.now() - 20 * 60 * 1000)
    },
    {
      _id: 'notif-002',
      userId: 'user-student-001',
      type: 'Queues',
      title: 'Canteen Token Update',
      message: 'Your token CAN-142 is approaching! 2 orders ahead of you.',
      read: false,
      createdAt: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      _id: 'notif-003',
      userId: 'user-student-001',
      type: 'Expenses',
      title: 'Budget Alert (45% Used)',
      message: 'You have spent ₹3,649 out of your ₹8,000 monthly allowance.',
      read: true,
      createdAt: new Date(Date.now() - 2 * 86400000)
    },
    {
      _id: 'notif-004',
      userId: 'user-student-001',
      type: 'Study',
      title: 'Upcoming Exam Reminder',
      message: 'Data Structures exam is in 4 days. Revision slot open today at 4:30 PM.',
      read: false,
      createdAt: new Date(Date.now() - 3 * 3600000)
    }
  ];

  console.log('✅ Student Help: Seed data successfully initialized into memory store.');
}

/**
 * Hydrates the local memory store with latest records from Supabase
 */
export async function hydrateFromSupabase() {
  try {
    console.log('🔄 Syncing live data from Supabase Cloud PostgreSQL...');

    // 1. Sync Users
    const dbStudents = await supabaseService.getAllStudents();
    if (dbStudents && dbStudents.length > 0) {
      const adminUsers = memoryStore.users.filter(u => u.role === 'admin');
      memoryStore.users = [...adminUsers, ...dbStudents];
      console.log(`✅ Loaded ${dbStudents.length} student records from Supabase.`);
    }

    // 2. Sync Incidents
    const dbIncidents = await supabaseService.getIncidents('all');
    if (dbIncidents && dbIncidents.length > 0) {
      memoryStore.incidents = dbIncidents;
      console.log(`✅ Loaded ${dbIncidents.length} campus safety incidents from Supabase.`);
    }

    // 3. Sync Queue Services & Tokens
    const dbQueues = await supabaseService.getQueueServices();
    if (dbQueues && dbQueues.length > 0) {
      memoryStore.queueServices = dbQueues;
      console.log(`✅ Loaded ${dbQueues.length} queue services from Supabase.`);
    }

    const dbTokens = await supabaseService.getQueueTokens();
    if (dbTokens && dbTokens.length > 0) {
      memoryStore.queueTokens = dbTokens;
    }

    // 4. Sync Expenses
    const dbExpenses = await supabaseService.getExpenses();
    if (dbExpenses && dbExpenses.length > 0) {
      memoryStore.expenses = dbExpenses;
    }

    // 5. Sync Exams & Study Sessions
    const dbExams = await supabaseService.getExams();
    if (dbExams && dbExams.length > 0) {
      memoryStore.exams = dbExams;
    }

    const dbSessions = await supabaseService.getStudySessions();
    if (dbSessions && dbSessions.length > 0) {
      memoryStore.studySessions = dbSessions;
    }

    console.log('✨ Data synchronization with Supabase complete.');
  } catch (err) {
    console.warn('⚠️ Error hydrating from Supabase:', err.message);
  }
}

/**
 * Sync helper functions (Write-through to Supabase with non-blocking error handling)
 */
export async function syncUserToSupabase(user) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.createUser(user);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (User):', err.message);
    return null;
  }
}

export async function syncIncidentToSupabase(incident) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.createIncident(incident);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (Incident):', err.message);
    return null;
  }
}

export async function syncIncidentStatusToSupabase(id, status) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.updateIncidentStatus(id, status);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (IncidentStatus):', err.message);
    return null;
  }
}

export async function syncQueueTokenToSupabase(token) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.createQueueToken(token);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (QueueToken):', err.message);
    return null;
  }
}

export async function syncExpenseToSupabase(expense) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.createExpense(expense);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (Expense):', err.message);
    return null;
  }
}

export async function syncExamToSupabase(exam) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.saveExam(exam);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (Exam):', err.message);
    return null;
  }
}

export async function syncStudyPlanToSupabase(plan) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.saveStudyPlan(plan);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (StudyPlan):', err.message);
    return null;
  }
}

export async function syncStudySessionToSupabase(session) {
  if (!isSupabaseConfigured()) return null;
  try {
    return await supabaseService.logStudySession(session);
  } catch (err) {
    console.warn('⚠️ Supabase sync error (StudySession):', err.message);
    return null;
  }
}

/**
 * Initializes database connection with graceful fallback
 */
export async function connectDatabase() {
  // Always seed initial in-memory data first so the app has instant local defaults
  await seedInitialData();

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured()) {
    console.log('⚡ Checking Supabase Cloud PostgreSQL connection...');
    const connected = await testSupabaseConnection();
    if (connected) {
      memoryStore.isUsingMemory = false;
      memoryStore.dbEngine = 'Supabase Cloud PostgreSQL';
      console.log('🚀 Supabase Cloud PostgreSQL connected successfully! (Tables, RLS & Realtime enabled)');
      await hydrateFromSupabase();
      return;
    } else {
      console.warn('⚠️ Supabase credentials provided but connection failed. Falling back to in-memory store.');
    }
  }

  // 2. Try MongoDB Atlas if configured
  if (CONFIG.MONGODB_URI) {
    try {
      console.log('Connecting to MongoDB Atlas at:', CONFIG.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
      await mongoose.connect(CONFIG.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
      memoryStore.isUsingMemory = false;
      memoryStore.dbEngine = 'MongoDB Atlas';
      console.log('🚀 Connected successfully to MongoDB Atlas.');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error:', err.message);
      console.log('💡 Engaging resilient in-memory data store for hackathon operation.');
    }
  } else {
    console.log('ℹ️ Running in resilient fallback mode (Zero setup required). Supabase ready.');
  }

  // Fallback to memory
  memoryStore.isUsingMemory = true;
  memoryStore.dbEngine = 'In-Memory (Local Seeded)';
}
