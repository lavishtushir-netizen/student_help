import express from 'express';
import { verifyToken, verifyAdmin } from './auth.js';
import { memoryStore } from './database.js';

export const usersRouter = express.Router();

// GET: Profile of current logged-in user
usersRouter.get('/profile', verifyToken, (req, res) => {
  const user = memoryStore.users.find(u => u._id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const userSafe = { ...user };
  delete userSafe.password;
  res.json({ success: true, profile: userSafe });
});

// PUT: Update Profile Details (e.g. Budget, Phone, Hostel)
usersRouter.put('/profile', verifyToken, (req, res) => {
  const userIndex = memoryStore.users.findIndex(u => u._id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const { budget, phone, hostel, roomNo, department, year } = req.body;
  const user = memoryStore.users[userIndex];

  if (budget !== undefined) user.budget = Number(budget);
  if (phone) user.phone = phone;
  if (hostel) user.hostel = hostel;
  if (roomNo) user.roomNo = roomNo;
  if (department) user.department = department;
  if (year) user.year = year;

  memoryStore.users[userIndex] = user;

  const userSafe = { ...user };
  delete userSafe.password;

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    profile: userSafe
  });
});

// GET: Admin list of all users
usersRouter.get('/all', verifyToken, verifyAdmin, (req, res) => {
  const safeList = memoryStore.users.map(u => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });
  res.json({ success: true, count: safeList.length, users: safeList });
});
