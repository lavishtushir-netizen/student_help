import express from 'express';
import QRCode from 'qrcode';
import { verifyToken } from './auth.js';
import { memoryStore, syncQueueTokenToSupabase } from './database.js';
import { generateTokenCode } from './utils.js';
import { emitQueueUpdated } from './socket.js';

export const queuesRouter = express.Router();

// GET: All virtual queue services & current live status
queuesRouter.get('/', (req, res) => {
  // Update live people ahead & active wait times for all services
  const services = memoryStore.queueServices.map(service => {
    const waitingTokens = memoryStore.queueTokens.filter(
      t => t.serviceId === service._id && t.status === 'Waiting'
    );
    return {
      ...service,
      currentQueueCount: waitingTokens.length,
      estimatedWaitMinutes: waitingTokens.length * service.averageWaitMinutes
    };
  });

  res.json({ success: true, services });
});

// GET: Current user's active queue tokens
queuesRouter.get('/my-tokens', verifyToken, (req, res) => {
  const userTokens = memoryStore.queueTokens.filter(t => t.userId === req.user.id);
  // Compute up-to-date position for each waiting token
  const enrichedTokens = userTokens.map(tok => {
    const service = memoryStore.queueServices.find(s => s._id === tok.serviceId);
    if (tok.status === 'Waiting') {
      const earlierTokens = memoryStore.queueTokens.filter(
        t => t.serviceId === tok.serviceId &&
             t.status === 'Waiting' &&
             new Date(t.createdAt) < new Date(tok.createdAt)
      );
      tok.peopleAhead = earlierTokens.length;
      tok.estimatedWaitMinutes = (earlierTokens.length + 1) * (service?.averageWaitMinutes || 5);
    }
    return { ...tok, serviceCurrentServing: service?.currentServingToken };
  });

  res.json({ success: true, tokens: enrichedTokens });
});

// POST: Book a Digital Token with QR Code
queuesRouter.post('/book', verifyToken, async (req, res) => {
  try {
    const { serviceId, timeSlot, partySize } = req.body;

    const service = memoryStore.queueServices.find(s => s._id === serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Invalid queue service selected.' });
    }

    // Increment service counter
    service.totalIssuedToday = (service.totalIssuedToday || 100) + 1;
    const tokenCode = generateTokenCode(service.category, service.totalIssuedToday);

    // Calculate how many people ahead
    const waitingTokens = memoryStore.queueTokens.filter(
      t => t.serviceId === service._id && t.status === 'Waiting'
    );
    const peopleAhead = waitingTokens.length;
    const estimatedWaitMinutes = Math.max(2, (peopleAhead + 1) * (service.averageWaitMinutes || 5));

    const qrPayload = JSON.stringify({
      tokenCode,
      serviceName: service.name,
      userId: req.user.id,
      timestamp: Date.now()
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 2,
      color: {
        dark: '#1e40af',
        light: '#ffffff'
      }
    });

    const newToken = {
      _id: `token-${Date.now()}`,
      serviceId: service._id,
      serviceName: service.name,
      tokenCode,
      userId: req.user.id,
      studentName: req.user.name || 'Student',
      partySize: Number(partySize) || 1,
      timeSlot: timeSlot || 'Immediate Next Slot',
      peopleAhead,
      estimatedWaitMinutes,
      status: 'Waiting',
      qrCodeData: qrCodeDataUrl,
      createdAt: new Date()
    };

    memoryStore.queueTokens.push(newToken);
    syncQueueTokenToSupabase(newToken).catch(e => console.warn('Supabase queue token sync:', e.message));
    emitQueueUpdated({ serviceId: service._id, token: newToken, action: 'BOOKED' });

    res.status(201).json({
      success: true,
      message: `Token ${tokenCode} generated successfully!`,
      token: newToken
    });
  } catch (err) {
    console.error('Queue booking error:', err);
    res.status(500).json({ success: false, message: 'Could not book queue token.' });
  }
});

// POST: QR Check-In (Student arrives & scans at service desk)
queuesRouter.post('/check-in', verifyToken, (req, res) => {
  const { tokenCode } = req.body;
  const token = memoryStore.queueTokens.find(t => t.tokenCode === tokenCode);

  if (!token) {
    return res.status(404).json({ success: false, message: 'Invalid or expired token QR.' });
  }

  if (token.status === 'Completed' || token.status === 'Checked-In') {
    return res.json({ success: true, message: 'Token has already been checked in.', token });
  }

  token.status = 'Checked-In';
  token.checkedInAt = new Date();

  emitQueueUpdated({ serviceId: token.serviceId, token, action: 'CHECKED_IN' });

  res.json({
    success: true,
    message: `Attendance confirmed! Welcome to ${token.serviceName}.`,
    token
  });
});

// POST: Admin / Counter Action: Call Next Token
queuesRouter.post('/call-next', verifyToken, (req, res) => {
  const { serviceId } = req.body;
  const service = memoryStore.queueServices.find(s => s._id === serviceId);

  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  // Find next waiting token
  const waitingToken = memoryStore.queueTokens.find(
    t => t.serviceId === serviceId && (t.status === 'Waiting' || t.status === 'Checked-In')
  );

  if (waitingToken) {
    waitingToken.status = 'Completed';
    service.currentServingToken = waitingToken.tokenCode;
  } else {
    // Increment token sequence display
    const parts = (service.currentServingToken || 'TKN-001').split('-');
    const nextNum = (parseInt(parts[1], 10) || 1) + 1;
    service.currentServingToken = `${parts[0]}-${String(nextNum).padStart(3, '0')}`;
  }

  emitQueueUpdated({ serviceId, currentServingToken: service.currentServingToken, action: 'CALLED_NEXT' });

  res.json({
    success: true,
    message: `Now serving token ${service.currentServingToken}`,
    currentServingToken: service.currentServingToken
  });
});

// GET: Queue Analytics (Peak hours, average waiting times, heatmaps)
queuesRouter.get('/analytics', (req, res) => {
  const analyticsData = {
    averageWaitTimeOverall: 5.8,
    dailyVisitorsTotal: 462,
    serviceWaitTimes: [
      { name: 'Canteen', wait: 6, visitors: 146 },
      { name: 'Dispensary', wait: 8, visitors: 48 },
      { name: 'Library', wait: 3, visitors: 89 },
      { name: 'Student Office', wait: 10, visitors: 34 },
      { name: 'Printing Shop', wait: 4, visitors: 115 },
      { name: 'Green Cafe', wait: 5, visitors: 67 }
    ],
    peakHoursHeatmap: [
      { hour: '09:00', load: 'Moderate', count: 42 },
      { hour: '11:00', load: 'High', count: 78 },
      { hour: '13:00', load: 'Peak', count: 124 },
      { hour: '15:00', load: 'High', count: 68 },
      { hour: '17:00', load: 'Moderate', count: 52 },
      { hour: '19:00', load: 'Low', count: 26 }
    ]
  };

  res.json({ success: true, analytics: analyticsData });
});
