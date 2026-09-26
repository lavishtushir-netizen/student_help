import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Supabase Data Service
 * Maps CampusCare AI operations to Supabase PostgreSQL tables.
 */
export const supabaseService = {
  // ==========================================
  // 1. USERS & AUTH
  // ==========================================
  async getUserByEmail(email) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) {
      console.warn('Supabase getUserByEmail error:', error.message);
      return null;
    }
    return data ? mapUserFromDb(data) : null;
  },

  async getUserById(id) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data ? mapUserFromDb(data) : null;
  },

  async createUser(user) {
    if (!isSupabaseConfigured()) return null;
    const dbUser = {
      id: user._id || `user-${Date.now()}`,
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role || 'student',
      student_id: user.studentId || `SRM-${Math.floor(1000 + Math.random() * 9000)}`,
      department: user.department || 'Computer Science & Engineering',
      year: user.year || '1st Year',
      hostel: user.hostel || 'Campus Residence Complex',
      room_no: user.roomNo || 'N/A',
      phone: user.phone || 'N/A',
      avatar: user.avatar,
      budget: user.budget || 8000
    };

    const { data, error } = await supabase
      .from('users')
      .insert([dbUser])
      .select()
      .single();

    if (error) {
      console.error('Supabase createUser error:', error.message);
      throw error;
    }
    return mapUserFromDb(data);
  },

  async getAllStudents() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getAllStudents error:', error.message);
      return [];
    }
    return (data || []).map(mapUserFromDb);
  },

  // ==========================================
  // 2. CAMPUS SAFETY INCIDENTS
  // ==========================================
  async getIncidents(status) {
    if (!isSupabaseConfigured()) return [];
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(mapIncidentFromDb);
  },

  async createIncident(incident) {
    if (!isSupabaseConfigured()) return null;
    const dbInc = {
      id: incident._id || `inc-${Date.now()}`,
      user_id: incident.userId,
      type: incident.type,
      title: incident.title,
      description: incident.description,
      building: incident.building,
      floor: incident.floor,
      lat: incident.lat,
      lng: incident.lng,
      priority: incident.priority || 'Medium',
      status: incident.status || 'Reported',
      reporters_count: incident.reportersCount || 1,
      estimated_response_time: incident.estimatedResponseTime,
      suggested_responder: incident.suggestedResponder,
      photo_url: incident.photoUrl
    };

    const { data, error } = await supabase.from('incidents').insert([dbInc]).select().single();
    if (error) throw error;
    return mapIncidentFromDb(data);
  },

  async updateIncidentStatus(id, newStatus) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapIncidentFromDb(data);
  },

  // ==========================================
  // 3. QUEUE SERVICES & TOKENS
  // ==========================================
  async getQueueServices() {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('queue_services').select('*').order('name');
    if (error) return [];
    return (data || []).map(s => ({
      _id: s.id,
      id: s.id,
      name: s.name,
      code: s.code,
      location: s.location,
      status: s.status,
      currentServingToken: s.current_serving_token,
      currentQueueCount: s.current_queue_count,
      averageWaitMinutes: Number(s.average_wait_minutes),
      totalIssuedToday: s.total_issued_today
    }));
  },

  async getQueueTokens(userId) {
    if (!isSupabaseConfigured()) return [];
    let q = supabase.from('queue_tokens').select('*').order('created_at', { ascending: false });
    if (userId) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) return [];
    return (data || []).map(t => ({
      _id: t.id,
      id: t.id,
      userId: t.user_id,
      serviceId: t.service_id,
      serviceName: t.service_name,
      studentName: t.student_name,
      tokenCode: t.token_code,
      status: t.status,
      partySize: t.party_size,
      timeSlot: t.time_slot,
      createdAt: t.created_at
    }));
  },

  async createQueueToken(tokenData) {
    if (!isSupabaseConfigured()) return null;
    const dbToken = {
      id: tokenData._id || `token-${Date.now()}`,
      user_id: tokenData.userId,
      service_id: tokenData.serviceId,
      service_name: tokenData.serviceName,
      student_name: tokenData.studentName,
      token_code: tokenData.tokenCode,
      status: tokenData.status || 'Active',
      party_size: tokenData.partySize || 1,
      time_slot: tokenData.timeSlot
    };

    const { data, error } = await supabase.from('queue_tokens').insert([dbToken]).select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 4. STUDYPULSE: PLANS, EXAMS & TIMER SESSIONS
  // ==========================================
  async getStudyPlan(userId) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      _id: data.id,
      userId: data.user_id,
      focusScore: data.focus_score,
      streakDays: data.streak_days,
      dailyTasks: data.daily_tasks || [],
      revisions: data.revisions || [],
      recommendations: data.recommendations || []
    };
  },

  async saveStudyPlan(plan) {
    if (!isSupabaseConfigured()) return null;
    const dbPlan = {
      id: plan._id || `plan-${Date.now()}`,
      user_id: plan.userId,
      focus_score: plan.focusScore,
      streak_days: plan.streakDays,
      daily_tasks: plan.dailyTasks,
      revisions: plan.revisions,
      recommendations: plan.recommendations,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('study_plans')
      .upsert([dbPlan], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) console.warn('Supabase saveStudyPlan error:', error.message);
    return data;
  },

  async getExams(userId) {
    if (!isSupabaseConfigured()) return [];
    let q = supabase.from('exams').select('*').order('date', { ascending: true });
    if (userId) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) return [];
    return (data || []).map(e => ({
      _id: e.id,
      userId: e.user_id,
      subject: e.subject,
      code: e.code,
      date: e.date,
      time: e.time,
      venue: e.venue,
      priority: e.priority,
      totalUnits: e.total_units,
      completedUnits: e.completed_units
    }));
  },

  async saveExam(exam) {
    if (!isSupabaseConfigured()) return null;
    const dbExam = {
      id: exam._id || `exam-${Date.now()}`,
      user_id: exam.userId,
      subject: exam.subject,
      code: exam.code,
      date: exam.date,
      time: exam.time,
      venue: exam.venue,
      priority: exam.priority || 'High',
      total_units: exam.totalUnits || 5,
      completed_units: exam.completedUnits || 1
    };

    const { data, error } = await supabase.from('exams').insert([dbExam]).select().single();
    if (error) throw error;
    return data;
  },

  async getStudySessions(userId) {
    if (!isSupabaseConfigured()) return [];
    let q = supabase.from('study_sessions').select('*').order('completed_at', { ascending: false });
    if (userId) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) return [];
    return (data || []).map(s => ({
      _id: s.id,
      userId: s.user_id,
      studentName: s.student_name,
      subject: s.subject,
      topic: s.topic,
      durationMinutes: s.duration_minutes,
      notes: s.notes,
      completedAt: s.completed_at
    }));
  },

  async logStudySession(session) {
    if (!isSupabaseConfigured()) return null;
    const dbSess = {
      id: session._id || `sess-${Date.now()}`,
      user_id: session.userId,
      student_name: session.studentName || 'Student',
      subject: session.subject,
      topic: session.topic,
      duration_minutes: session.durationMinutes,
      notes: session.notes,
      completed_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('study_sessions').insert([dbSess]).select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 5. EXPENSES
  // ==========================================
  async getExpenses(userId) {
    if (!isSupabaseConfigured()) return [];
    let q = supabase.from('expenses').select('*').order('date', { ascending: false });
    if (userId) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) return [];
    return (data || []).map(e => ({
      _id: e.id,
      userId: e.user_id,
      title: e.title,
      amount: Number(e.amount),
      category: e.category,
      date: e.date,
      notes: e.notes,
      createdAt: e.created_at
    }));
  },

  async createExpense(expense) {
    if (!isSupabaseConfigured()) return null;
    const dbExp = {
      id: expense._id || `exp-${Date.now()}`,
      user_id: expense.userId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    };
    const { data, error } = await supabase.from('expenses').insert([dbExp]).select().single();
    if (error) throw error;
    return data;
  }
};

// Helper mapper functions
function mapUserFromDb(u) {
  return {
    _id: u.id,
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    studentId: u.student_id,
    department: u.department,
    year: u.year,
    hostel: u.hostel,
    roomNo: u.room_no,
    phone: u.phone,
    avatar: u.avatar,
    budget: Number(u.budget || 8000),
    createdAt: u.created_at
  };
}

function mapIncidentFromDb(i) {
  return {
    _id: i.id,
    id: i.id,
    userId: i.user_id,
    type: i.type,
    title: i.title,
    description: i.description,
    building: i.building,
    floor: i.floor,
    lat: i.lat,
    lng: i.lng,
    priority: i.priority,
    status: i.status,
    reportersCount: i.reporters_count,
    estimatedResponseTime: i.estimated_response_time,
    suggestedResponder: i.suggested_responder,
    photoUrl: i.photo_url,
    createdAt: i.created_at
  };
}
