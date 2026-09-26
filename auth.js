import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { CONFIG } from './config.js';
import { memoryStore, syncUserToSupabase } from './database.js';
import { supabaseService } from './supabaseService.js';
import { isSupabaseConfigured } from './supabaseClient.js';

export const authRouter = express.Router();

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.studentId
    },
    CONFIG.JWT_SECRET,
    { expiresIn: CONFIG.JWT_EXPIRES_IN }
  );
}

// Middleware: Authenticate JWT Token
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Session expired or token invalid. Please log in again.' });
  }
}

// Middleware: Verify Admin Access
export function verifyAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// POST: Student / User Signup
authRouter.post('/signup', async (req, res) => {
  try {
    const { name, email, password, studentId, department, year, hostel, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
      studentId: studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department || 'General Engineering',
      year: year || '1st Year',
      hostel: hostel || 'Campus Residence',
      budget: 8000,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date()
    };

    memoryStore.users.push(newUser);
    syncUserToSupabase(newUser).catch(e => console.warn('Supabase signup sync:', e.message));

    const token = generateToken(newUser);
    const userSafe = { ...newUser };
    delete userSafe.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST: Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user && isSupabaseConfigured()) {
      const dbUser = await supabaseService.getUserByEmail(email);
      if (dbUser) {
        memoryStore.users.push(dbUser);
        user = dbUser;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const userSafe = { ...user };
    delete userSafe.password;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST: Demo Quick Login (Student or Admin)
authRouter.post('/demo-login', async (req, res) => {
  try {
    const { role = 'student' } = req.body;
    const targetEmail = role === 'admin' ? 'admin@campus.edu' : 'student@campus.edu';

    let user = memoryStore.users.find(u => u.email === targetEmail);
    if (!user) {
      // Re-seed if needed
      user = memoryStore.users[0];
    }

    const token = generateToken(user);
    const userSafe = { ...user };
    delete userSafe.password;

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role === 'admin' ? 'Campus Admin' : 'Student'}!`,
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ success: false, message: 'Demo login failed.' });
  }
});

// POST: Forgot Password Request (Simulated Verification Link & Temporary Reset)
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered student or staff found with this email.' });
    }

    res.json({
      success: true,
      message: `A password reset link & OTP code has been dispatched to ${email}. (Demo OTP: 442918)`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing password reset.' });
  }
});

// GET: Current Authenticated User Profile
authRouter.get('/me', verifyToken, (req, res) => {
  const user = memoryStore.users.find(u => u._id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const userSafe = { ...user };
  delete userSafe.password;
  res.json({ success: true, user: userSafe });
});
