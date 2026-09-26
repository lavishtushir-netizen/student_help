/**
 * Student Help - Core Utilities & Campus Landmark Geodata
 */

// 1. SRM University Delhi-NCR (Rajiv Gandhi Education City, Rai, Sonepat, Haryana) - Primary Campus
export const SRM_RAI_LANDMARKS = [
  { id: 'rai-main-admin', name: 'Main Administrative & Academic Tower', type: 'Academic Block', lat: 28.9192, lng: 77.1285, description: 'Vice Chancellor Secretariat, Registrar, Central Lecture Halls' },
  { id: 'rai-engineering', name: 'Faculty of Engineering & Technology', type: 'Academic Block', lat: 28.9195, lng: 77.1292, description: 'CSE, AI & Data Science, Robotics, Mechanical & ECE Labs' },
  { id: 'rai-law', name: 'Faculty of Law & Moot Court Complex', type: 'Academic Block', lat: 28.9186, lng: 77.1278, description: 'Bar Council Recognized Law Wing, Moot Court Hall, Legal Aid Clinic' },
  { id: 'rai-mgmt', name: 'Faculty of Management & Commerce', type: 'Academic Block', lat: 28.9188, lng: 77.1298, description: 'MBA, FinTech Lab, Corporate Seminar Rooms & Case Study Halls' },
  { id: 'rai-library', name: 'Central Knowledge Resource & Digital Library', type: 'Library', lat: 28.9196, lng: 77.1280, description: '3-Story Central Library, IEEE Xplore, AC Silent Reading Halls' },
  { id: 'rai-hostel-boys', name: 'Vivekananda Boys Residential Complex', type: 'Hostel', lat: 28.9200, lng: 77.1310, description: 'AC Student Hostel Towers with 24x7 High-Speed Wi-Fi & Mess' },
  { id: 'rai-hostel-girls', name: 'Kalpana Chawla Girls Residential Complex', type: 'Hostel', lat: 28.9178, lng: 77.1315, description: 'Secured Girls Hostel with Biometric Access & Dedicated Wardens' },
  { id: 'rai-canteen', name: 'Campus Dining & Food Court Plaza', type: 'Canteen', lat: 28.9191, lng: 77.1302, description: 'Multi-cuisine dining hall, bakery, beverage corner & student lounge' },
  { id: 'rai-medical', name: 'University Health Centre & Emergency Clinic', type: 'Hospital', lat: 28.9184, lng: 77.1288, description: '24x7 emergency medical aid, attending physicians, ambulance' },
  { id: 'rai-sports', name: 'Indoor Sports Stadium & Gymnasium', type: 'Sports Complex', lat: 28.9201, lng: 77.1265, description: 'Indoor badminton, basketball, gym, yoga studio & table tennis' },
  { id: 'rai-cricket', name: 'University Cricket & Athletic Arena', type: 'Sports Complex', lat: 28.9198, lng: 77.1250, description: 'Full-size cricket ground, football turf & 400m running track' },
  { id: 'rai-gate', name: 'University Main Gate & Security Command', type: 'Security', lat: 28.9182, lng: 77.1260, description: 'Grand entrance on Rajiv Gandhi Education City Boulevard, Rai' },
  { id: 'rai-transport', name: 'Campus Transit Shuttle & Bus Station', type: 'Bus Stop', lat: 28.9180, lng: 77.1268, description: 'University shuttle service connecting Delhi Metro & Sonepat' },
  { id: 'rai-bank', name: 'Campus Bank & 24x7 ATM Center', type: 'ATM', lat: 28.9185, lng: 77.1272, description: 'Full banking branch and 24-hour multi-bank ATM kiosks' },
  { id: 'rai-printing', name: 'Academic Printing & Tech Reprographic Center', type: 'Printing Shop', lat: 28.9193, lng: 77.1288, description: 'Project reports, photocopying, thesis binding & stationery' },
  { id: 'rai-student-affairs', name: 'Student Affairs & Placement Directorate', type: 'Student Office', lat: 28.9189, lng: 77.1283, description: 'Career development centre, placements, clubs & activities' }
];

// 2. SRM Institute of Science and Technology (Delhi-NCR Campus, Modinagar / Ghaziabad, UP)
export const SRM_DELHI_NCR_LANDMARKS = [
  { id: 'ncr-acad', name: 'Main Academic Block (Engineering & Technology)', type: 'Academic Block', lat: 28.7978, lng: 77.5388, description: 'Computer Science, AI & ML, Mechanical & Electrical Engineering Labs' },
  { id: 'ncr-mgmt', name: 'Management & Hotel Management Block', type: 'Academic Block', lat: 28.7972, lng: 77.5392, description: 'MBA, BBA, Hotel Management & Commercial Kitchen Labs' },
  { id: 'ncr-library', name: 'SRM Central Library & Digital Knowledge Hub', type: 'Library', lat: 28.7981, lng: 77.5385, description: '50,000+ volumes, IEEE digital access, air-conditioned reading halls' },
  { id: 'ncr-boys-hostel', name: 'Boys Hostel Complex', type: 'Hostel', lat: 28.7988, lng: 77.5395, description: 'Multi-story boys hostel towers, gymnasium, dining mess & indoor games' },
  { id: 'ncr-girls-hostel', name: 'Girls Hostel Complex', type: 'Hostel', lat: 28.7965, lng: 77.5398, description: 'Secure gated girls residential towers with 24x7 biometric security' },
  { id: 'ncr-canteen', name: 'Campus Central Canteen & Food Court', type: 'Canteen', lat: 28.7975, lng: 77.5395, description: 'North & South Indian meals, snacks, juice bar & Nescafe corner' },
  { id: 'ncr-medical', name: 'SRM 24/7 Health Care Centre & Dispensary', type: 'Hospital', lat: 28.7970, lng: 77.5382, description: 'Emergency OPD, resident doctor on duty, campus ambulance' },
  { id: 'ncr-auditorium', name: 'Air-Conditioned Main Auditorium', type: 'Academic Block', lat: 28.7982, lng: 77.5380, description: 'Cultural fests, guest keynotes, hackathons and convocations' },
  { id: 'ncr-sports', name: 'Sports Arena & 400m Athletic Track', type: 'Sports Complex', lat: 28.7990, lng: 77.5375, description: 'Cricket turf, football pitch, 400m running track' },
  { id: 'ncr-gate', name: 'Main Gate & Security Command (Delhi-Meerut Rd)', type: 'Security', lat: 28.7960, lng: 77.5385, description: 'Main entrance on NH 34, RFID boom barrier, visitor desk' }
];

// 3. SRM IST Main Campus (KTR, Chennai)
export const SRM_KTR_LANDMARKS = [
  { id: 'tech-park', name: 'SRM Tech Park (School of Computing & CSE)', type: 'Academic Block', lat: 12.8248, lng: 80.0450, description: 'CSE Labs, AI Research Hub, Software Development Centers' },
  { id: 'univ-building', name: 'University Building (UB - 15 Stories)', type: 'Academic Block', lat: 12.8233, lng: 80.0444, description: 'Chancellor & VC Office, Central Administration, Lecture Halls' },
  { id: 'auditorium-lib', name: 'Dr. T. P. Ganesan Auditorium & Central Library', type: 'Library', lat: 12.8225, lng: 80.0455, description: 'Asia premier 4000-seat auditorium, 4-story Central Digital Library' },
  { id: 'srm-hospital', name: 'SRM Medical College Hospital & Research Centre', type: 'Hospital', lat: 12.8212, lng: 80.0430, description: '24x7 Emergency Trauma Unit, ICU, Pharmacy, Blood Bank' },
  { id: 'food-court-java', name: 'SRM Central Food Court & Java Green', type: 'Canteen', lat: 12.8240, lng: 80.0448, description: 'Multi-cuisine Food Court, Subway, Fresh Juices, Snacks' },
  { id: 'hostel-oori', name: 'Oori & Paari Boys Hostels', type: 'Hostel', lat: 12.8260, lng: 80.0460, description: 'Major Junior Boys Residential Towers & Mess' },
  { id: 'hostel-girls', name: 'Senbagam, Meenakshi & Begum Girls Hostels', type: 'Hostel', lat: 12.8220, lng: 80.0475, description: 'Secured Girls Hostel Complex with 24x7 Surveillance' }
];

// Campus Presets for Instant 1-Click Campus Switching
export const CAMPUS_PRESETS = [
  {
    id: 'srm-delhi-ncr-rai',
    name: 'SRM University Delhi-NCR (Rai, Sonepat)',
    shortName: 'SRM Delhi-NCR (Rai)',
    state: 'Haryana',
    address: 'Plot 39, Rajiv Gandhi Education City, Rai, Sonepat, Haryana 131029',
    lat: 28.9190,
    lng: 77.1286,
    zoom: 17,
    defaultUserLocation: { lat: 28.9200, lng: 77.1310 }, // Vivekananda Boys Residential Complex
    defaultDestination: 'rai-library',
    landmarks: SRM_RAI_LANDMARKS
  },
  {
    id: 'srm-delhi-ncr-modinagar',
    name: 'SRM IST Delhi-NCR Campus (Modinagar, Ghaziabad)',
    shortName: 'SRM Delhi-NCR (Ghaziabad)',
    state: 'Uttar Pradesh',
    address: 'Delhi-Meerut Road, Modinagar, Ghaziabad, UP 201204',
    lat: 28.7975,
    lng: 77.5389,
    zoom: 17,
    defaultUserLocation: { lat: 28.7988, lng: 77.5395 }, // Boys Hostel Complex
    defaultDestination: 'ncr-library',
    landmarks: SRM_DELHI_NCR_LANDMARKS
  },
  {
    id: 'srm-ktr-chennai',
    name: 'SRM IST Main Campus (KTR, Chennai)',
    shortName: 'SRM KTR (Chennai)',
    state: 'Tamil Nadu',
    address: 'GST Road, Potheri, Kattankulathur, Tamil Nadu 603203',
    lat: 12.8237,
    lng: 80.0444,
    zoom: 16,
    defaultUserLocation: { lat: 12.8260, lng: 80.0460 },
    defaultDestination: 'auditorium-lib',
    landmarks: SRM_KTR_LANDMARKS
  }
];

// Default Active Landmarks: SRM University Delhi-NCR (Rai, Sonepat)
export const CAMPUS_LANDMARKS = SRM_RAI_LANDMARKS;

/**
 * Calculates Haversine distance between two GPS coordinates in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // returns distance in meters
}

/**
 * Calculates estimated walking time based on meters (80 meters/min)
 */
export function calculateWalkingTime(distanceMeters) {
  const walkingSpeedMpm = 80; // 80 m/minute (~4.8 km/h)
  const minutes = Math.ceil(distanceMeters / walkingSpeedMpm);
  return Math.max(1, minutes);
}

/**
 * Generate unique token code with service abbreviation
 */
export function generateTokenCode(serviceType, sequenceNumber) {
  const prefixMap = {
    'Canteen': 'CAN',
    'Hospital': 'MED',
    'Library Help Desk': 'LIB',
    'Student Office': 'ADM',
    'Cafeteria': 'CAF',
    'Printing Shop': 'PRT'
  };
  const prefix = prefixMap[serviceType] || 'TKN';
  return `${prefix}-${String(sequenceNumber).padStart(3, '0')}`;
}

/**
 * Detect Duplicate Incident within radius and time window
 */
export function isDuplicateIncident(newIncident, existingIncidents) {
  const TIME_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours
  const RADIUS_THRESHOLD_METERS = 75; // 75 meters radius or same building name

  for (const existing of existingIncidents) {
    if (existing.status === 'Resolved') continue;

    // Check same category/type
    const sameType = existing.type?.toLowerCase() === newIncident.type?.toLowerCase();

    // Check time
    const incidentTime = new Date(existing.createdAt || existing.date || Date.now()).getTime();
    const timeDiff = Math.abs(Date.now() - incidentTime);

    // Check building match
    const sameBuilding = existing.building && newIncident.building &&
      existing.building.trim().toLowerCase() === newIncident.building.trim().toLowerCase();

    // Check coordinate distance if both have GPS
    let withinDistance = false;
    if (existing.location?.lat && newIncident.location?.lat) {
      const dist = calculateDistance(
        existing.location.lat,
        existing.location.lng,
        newIncident.location.lat,
        newIncident.location.lng
      );
      withinDistance = dist <= RADIUS_THRESHOLD_METERS;
    }

    if (sameType && timeDiff <= TIME_WINDOW_MS && (sameBuilding || withinDistance)) {
      return existing;
    }
  }

  return null;
}

/**
 * Dynamic Safe Route calculation bypassing hazardous incident locations
 */
export function calculateSafeRoute(userLocation, destinationCoords, activeHazards = []) {
  const userLat = userLocation?.lat || 12.8260; // Oori & Paari Hostels
  const userLng = userLocation?.lng || 80.0460;
  const destLat = destinationCoords?.lat || 12.8225; // Central Library & Auditorium
  const destLng = destinationCoords?.lng || 80.0455;

  // Filter high/critical hazards
  const blockingHazards = activeHazards.filter(h =>
    h.status !== 'Resolved' && (h.priority === 'Critical' || h.priority === 'High')
  );

  // If a hazard is directly between user and destination, offset via safe campus boulevard
  let detourNeeded = false;
  let detourPoint = null;
  let detourReason = '';

  for (const hazard of blockingHazards) {
    if (!hazard.location?.lat) continue;
    const distToUser = calculateDistance(userLat, userLng, hazard.location.lat, hazard.location.lng);
    const distToDest = calculateDistance(destLat, destLng, hazard.location.lat, hazard.location.lng);
    const directDist = calculateDistance(userLat, userLng, destLat, destLng);

    // Hazard is within the corridor if sum of legs is close to direct distance
    if (distToUser + distToDest < directDist * 1.25 && distToUser > 20) {
      detourNeeded = true;
      detourReason = `${hazard.type || 'Incident'} reported near ${hazard.building || 'Campus Zone'}.`;
      // Offset perpendicular waypoint
      const midLat = (userLat + destLat) / 2;
      const midLng = (userLng + destLng) / 2;
      // Detour eastward along Central Boulevard
      detourPoint = {
        lat: midLat + (hazard.location.lat > midLat ? -0.0008 : 0.0008),
        lng: midLng + 0.0012,
        name: 'Safe Promenade / Central Boulevard'
      };
      break;
    }
  }

  const waypoints = [
    [userLat, userLng]
  ];

  if (detourNeeded && detourPoint) {
    waypoints.push([detourPoint.lat, detourPoint.lng]);
  }

  waypoints.push([destLat, destLng]);

  const totalDist = detourNeeded
    ? calculateDistance(userLat, userLng, detourPoint.lat, detourPoint.lng) +
      calculateDistance(detourPoint.lat, detourPoint.lng, destLat, destLng)
    : calculateDistance(userLat, userLng, destLat, destLng);

  return {
    waypoints,
    distanceMeters: totalDist,
    walkingTimeMinutes: calculateWalkingTime(totalDist),
    detourRecommended: detourNeeded,
    advice: detourNeeded
      ? `CAUTION: ${detourReason} AI routed safely via Central Boulevard.`
      : 'Standard direct pathway is clear and safe.'
  };
}
