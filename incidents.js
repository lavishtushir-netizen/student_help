import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken, verifyAdmin } from './auth.js';
import { memoryStore, syncIncidentToSupabase, syncIncidentStatusToSupabase } from './database.js';
import { prioritizeIncidentAI } from './ai.js';
import { isDuplicateIncident, calculateSafeRoute, calculateDistance, calculateWalkingTime } from './utils.js';
import { emitIncidentCreated, emitIncidentUpdated, emitCampusBroadcast } from './socket.js';

export const incidentsRouter = express.Router();

// Multer storage for incident photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `incident-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET: All incidents (supports optional filter by status or priority)
incidentsRouter.get('/', (req, res) => {
  const { status, priority } = req.query;
  let results = [...memoryStore.incidents];

  if (status && status !== 'all') {
    results = results.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (priority && priority !== 'all') {
    results = results.filter(i => i.priority.toLowerCase() === priority.toLowerCase());
  }

  // Sort by priority and recency
  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  results.sort((a, b) => {
    const prioDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (prioDiff !== 0) return prioDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ success: true, count: results.length, incidents: results });
});

// GET: Single incident details
incidentsRouter.get('/:id', (req, res) => {
  const incident = memoryStore.incidents.find(i => i._id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident record not found.' });
  }
  res.json({ success: true, incident });
});

// POST: Report new incident (with AI Prioritization and Duplicate Merging)
incidentsRouter.post('/', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { type, title, description, building, floor, lat, lng } = req.body;

    if (!type || !title || !description || !building) {
      return res.status(400).json({ success: false, message: 'Incident type, title, description, and building are required.' });
    }

    const reporterUser = memoryStore.users.find(u => u._id === req.user.id);
    const reporterName = reporterUser ? reporterUser.name : (req.user.name || 'Anonymous Student');

    const photoUrl = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.photoUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=400');

    const locationCoords = {
      lat: Number(lat) || 28.5450,
      lng: Number(lng) || 77.1926
    };

    const incidentCandidate = {
      type,
      title,
      description,
      building,
      floor: floor || 'Ground Floor',
      location: locationCoords
    };

    // 1. Check for Duplicate Nearby Incident
    const duplicate = isDuplicateIncident(incidentCandidate, memoryStore.incidents);
    if (duplicate) {
      duplicate.reportersCount = (duplicate.reportersCount || 1) + 1;
      if (!duplicate.reporterNames.includes(reporterName)) {
        duplicate.reporterNames.push(reporterName);
      }
      // Elevate urgency if multiple reports arrive
      if (duplicate.reportersCount >= 3 && duplicate.priority === 'Medium') {
        duplicate.priority = 'High';
      }
      if (duplicate.reportersCount >= 5 && duplicate.priority === 'High') {
        duplicate.priority = 'Critical';
      }

      emitIncidentUpdated(duplicate);

      return res.status(200).json({
        success: true,
        isDuplicate: true,
        message: `Merged with existing report. ${duplicate.reportersCount} students have now reported this issue.`,
        incident: duplicate
      });
    }

    // 2. Perform AI Prioritization
    const aiAnalysis = await prioritizeIncidentAI({
      type,
      title,
      description,
      building,
      floor
    });

    const newIncident = {
      _id: `inc-${Date.now()}`,
      type,
      title,
      description,
      building,
      floor: floor || 'Ground Floor',
      location: locationCoords,
      priority: aiAnalysis.priority || 'Medium',
      status: 'Reported',
      estimatedResponseTime: aiAnalysis.estimatedResponseTime || '20-30 minutes',
      suggestedResponder: aiAnalysis.suggestedResponder || 'Campus Security & Facilities Unit',
      safetyInstructions: aiAnalysis.safetyInstructions || 'Maintain safety distance.',
      reportersCount: 1,
      reporterNames: [reporterName],
      reportedBy: req.user.id,
      photoUrl,
      createdAt: new Date()
    };

    memoryStore.incidents.unshift(newIncident);
    syncIncidentToSupabase(newIncident).catch(e => console.warn('Supabase incident sync:', e.message));

    // Broadcast new incident to all students & admins via Socket.io
    emitIncidentCreated(newIncident);

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully and dispatched to emergency team.',
      incident: newIncident
    });
  } catch (err) {
    console.error('Incident report error:', err);
    res.status(500).json({ success: false, message: 'Server error filing incident report.' });
  }
});

// PUT: Update Incident Status & Assign Responder (Admin / Responder action)
incidentsRouter.put('/:id/status', verifyToken, (req, res) => {
  const { status, suggestedResponder, notes } = req.body;
  const incidentIndex = memoryStore.incidents.findIndex(i => i._id === req.params.id);

  if (incidentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Incident record not found.' });
  }

  const incident = memoryStore.incidents[incidentIndex];
  if (status) incident.status = status;
  if (suggestedResponder) incident.suggestedResponder = suggestedResponder;
  if (notes) incident.adminNotes = notes;
  incident.updatedAt = new Date();

  memoryStore.incidents[incidentIndex] = incident;
  syncIncidentStatusToSupabase(req.params.id, status).catch(e => console.warn('Supabase incident status sync:', e.message));
  emitIncidentUpdated(incident);

  res.json({
    success: true,
    message: `Incident status updated to ${incident.status}`,
    incident
  });
});

// POST: Calculate Nearest Incident & AI-Suggested Safe Route
incidentsRouter.post('/safe-route', (req, res) => {
  const { userLat, userLng, destLat, destLng } = req.body;

  const userCoords = {
    lat: Number(userLat) || 28.5475,
    lng: Number(userLng) || 77.1910
  };

  const destCoords = {
    lat: Number(destLat) || 28.5452,
    lng: Number(destLng) || 77.1928
  };

  // Find nearest active hazard
  const activeIncidents = memoryStore.incidents.filter(i => i.status !== 'Resolved');
  let nearestHazard = null;
  let minHazardDistance = Infinity;

  activeIncidents.forEach(inc => {
    if (inc.location?.lat) {
      const dist = calculateDistance(userCoords.lat, userCoords.lng, inc.location.lat, inc.location.lng);
      if (dist < minHazardDistance) {
        minHazardDistance = dist;
        nearestHazard = { ...inc, distanceMeters: dist, walkingMinutes: calculateWalkingTime(dist) };
      }
    }
  });

  const safeRouteData = calculateSafeRoute(userCoords, destCoords, activeIncidents);

  res.json({
    success: true,
    userLocation: userCoords,
    destination: destCoords,
    nearestHazard,
    safeRoute: safeRouteData
  });
});

// POST: Emergency SOS Trigger
incidentsRouter.post('/sos', verifyToken, (req, res) => {
  const { lat, lng, message } = req.body;
  const user = memoryStore.users.find(u => u._id === req.user.id) || req.user;

  const sosIncident = {
    _id: `sos-${Date.now()}`,
    type: 'Security Issue',
    title: `🚨 EMERGENCY SOS: ${user.name || 'Student'} Triggered Alert!`,
    description: message || `Immediate assistance requested by ${user.name} (ID: ${user.studentId || 'N/A'}, Phone: ${user.phone || 'N/A'}).`,
    building: user.hostel || 'Campus Quad (Live GPS Active)',
    floor: 'Immediate Vicinity',
    location: {
      lat: Number(lat) || 28.5450,
      lng: Number(lng) || 77.1926
    },
    priority: 'Critical',
    status: 'Reported',
    estimatedResponseTime: '2-3 minutes',
    suggestedResponder: 'Chief Campus Security & Rapid Response Patrol',
    safetyInstructions: 'Armed campus security team and medical unit are en route to your GPS coordinate.',
    reportersCount: 1,
    reporterNames: [user.name || 'Student'],
    reportedBy: user._id || req.user.id,
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400',
    createdAt: new Date()
  };

  memoryStore.incidents.unshift(sosIncident);
  emitIncidentCreated(sosIncident);
  emitCampusBroadcast({
    id: `broadcast-${Date.now()}`,
    type: 'CRITICAL_SOS',
    title: `EMERGENCY SOS DISPATCHED`,
    message: `Security unit responding to distress call from ${user.name} near ${sosIncident.building}.`,
    timestamp: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'EMERGENCY SOS BROADCAST ACTIVATED! Campus Security and First Responders have been notified.',
    incident: sosIncident
  });
});
