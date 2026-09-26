import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ShieldAlert,
  MapPin,
  Navigation,
  PhoneCall,
  Share2,
  AlertTriangle,
  Info,
  Clock,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Layers,
  Crosshair,
  Maximize2
} from 'lucide-react';
import { incidentApi } from './api.js';
import { CAMPUS_PRESETS, calculateSafeRoute } from './utils.js';

export default function CampusMap({ onTriggerSOS }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [selectedCampusId, setSelectedCampusId] = useState('srm-delhi-ncr-rai');
  const currentCampus = CAMPUS_PRESETS.find(c => c.id === selectedCampusId) || CAMPUS_PRESETS[0];

  const [incidents, setIncidents] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('rai-library');
  const [userLocation, setUserLocation] = useState({ lat: 28.9200, lng: 77.1310 }); // Vivekananda Boys Residential Complex, Rai
  const [safeRouteData, setSafeRouteData] = useState(null);
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [mapStyle, setMapStyle] = useState('google-streets'); // 'google-streets', 'google-hybrid', 'osm'

  // Load incidents from API
  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await incidentApi.getAll();
        if (res.data.incidents) {
          setIncidents(res.data.incidents);
        }
      } catch (err) {
        console.error('Failed to load map incidents:', err);
      }
    }
    loadIncidents();
  }, []);

  // Initialize Leaflet Map with World-to-Street Zoom Range (minZoom: 2 to maxZoom: 21)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      center: [28.9190, 77.1286], // SRM University Delhi-NCR (Rajiv Gandhi Education City, Rai, Sonepat)
      zoom: 17,
      zoomControl: true,
      maxZoom: 21,
      minZoom: 2,               // Allows zooming out to the full World Map
      worldCopyJump: true       // Seamless globe panning
    });

    // Default to Google Maps accurate vector/raster streets
    const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    tileLayerRef.current = googleStreets;
    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Map Tile Style (Google Streets, Google Satellite Hybrid, OpenStreetMap)
  const switchMapStyle = (style) => {
    setMapStyle(style);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newLayer;
    if (style === 'google-hybrid') {
      // Google Maps Photorealistic Satellite with Road & Building Names
      newLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 21,
        attribution: '&copy; Google Maps Satellite'
      });
    } else if (style === 'osm') {
      // OpenStreetMap Community Detailed Map
      newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
    } else {
      // Google Maps Standard Road Map
      newLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 21,
        attribution: '&copy; Google Maps'
      });
    }

    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  };

  // Switch Active Campus
  const handleSwitchCampus = (campusId) => {
    const target = CAMPUS_PRESETS.find(c => c.id === campusId);
    if (!target) return;
    setSelectedCampusId(campusId);
    setUserLocation(target.defaultUserLocation);
    setSelectedDestination(target.defaultDestination);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom || 17, {
        duration: 1.5
      });
    }
  };

  // Smooth Navigation Actions
  const handleRecenterCampus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentCampus.lat, currentCampus.lng], currentCampus.zoom || 17, {
        duration: 1.5
      });
    }
  };

  const handleZoomToWorld = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2, {
        duration: 1.5
      });
    }
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 18, { duration: 1.5 });
          }
        },
        () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 17, { duration: 1.5 });
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Update Markers & Hazards on map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Campus Landmark Markers
    currentCampus.landmarks.forEach((landmark) => {
      let iconColor = '#3b82f6';
      if (landmark.type === 'Hospital') iconColor = '#ef4444';
      if (landmark.type === 'Canteen' || landmark.type === 'Cafeteria') iconColor = '#f59e0b';
      if (landmark.type === 'Hostel') iconColor = '#8b5cf6';
      if (landmark.type === 'Library') iconColor = '#06b6d4';

      const customIcon = L.divIcon({
        className: 'custom-landmark-marker',
        html: `
          <div style="background-color: ${iconColor}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 13px; color: white;">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([landmark.lat, landmark.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; max-width: 230px; line-height: 1.4; color: #f8fafc;">
          <b style="color: #60a5fa; font-size: 13px;">${landmark.name}</b><br/>
          <span style="color: #38bdf8; font-weight: 600;">${landmark.type}</span><br/>
          <p style="margin-top: 4px; color: #cbd5e1;">${landmark.description}</p>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lng}" target="_blank" style="color: #4ade80; text-decoration: underline; font-weight: bold;">
              Open in Google Maps →
            </a>
          </div>
        </div>
      `);
      markersLayerRef.current.addLayer(marker);
    });

    // 2. User Location Marker (Pulsing Radar Marker)
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(59, 130, 246, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; border: 3px solid white; box-shadow: 0 0 12px #3b82f6;"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindPopup('<b style="color: #3b82f6;">You Are Here</b><br/><span style="color: #94a3b8; font-size: 11px;">Live Student Location</span>');
    markersLayerRef.current.addLayer(userMarker);

    // 3. Live Incident Markers
    const filteredIncidents = incidents.filter(i => {
      if (filterPriority === 'all') return true;
      return i.priority.toLowerCase() === filterPriority.toLowerCase();
    });

    filteredIncidents.forEach((inc) => {
      if (!inc.location?.lat) return;

      let color = '#eab308'; // Medium
      let pulseClass = '';
      if (inc.priority === 'Critical') {
        color = '#ef4444'; // Red
        pulseClass = 'marker-pulse-critical';
      } else if (inc.priority === 'High') {
        color = '#f97316'; // Orange
      } else if (inc.priority === 'Low') {
        color = '#22c55e'; // Green
      }

      const hazardIcon = L.divIcon({
        className: 'incident-hazard-marker',
        html: `
          <div class="${pulseClass}" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${color}; color: white; font-weight: bold; font-size: 14px;">
            ⚠️
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const incidentMarker = L.marker([inc.location.lat, inc.location.lng], { icon: hazardIcon });
      incidentMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; max-width: 240px; line-height: 1.4; color: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: ${color}33; color: ${color}; border: 1px solid ${color}; padding: 1px 6px; border-radius: 9999px; font-weight: bold; font-size: 10px;">
              ${inc.priority.toUpperCase()} HAZARD
            </span>
            <span style="color: #94a3b8; font-size: 10px;">• ${inc.status}</span>
          </div>
          <b style="color: #ffffff; font-size: 13px;">${inc.title}</b><br/>
          <p style="color: #cbd5e1; margin: 4px 0;">${inc.description}</p>
          <div style="margin-top: 6px; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            📍 <b>${inc.building}</b> (${inc.floor})<br/>
            👥 <b>${inc.reportersCount || 1} student(s) reported this</b><br/>
            ⏱️ Response Unit: <span style="color: #60a5fa;">${inc.suggestedResponder}</span>
          </div>
        </div>
      `);
      markersLayerRef.current.addLayer(incidentMarker);
    });
  }, [incidents, userLocation, filterPriority, currentCampus]);

  // Compute Safe Route when destination changes
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    const targetLandmark = currentCampus.landmarks.find(l => l.id === selectedDestination) || currentCampus.landmarks[0];
    const destinationCoords = { lat: targetLandmark.lat, lng: targetLandmark.lng };

    const routeCalc = calculateSafeRoute(userLocation, destinationCoords, incidents);
    setSafeRouteData(routeCalc);

    // Draw route Polyline on map
    const polyline = L.polyline(routeCalc.waypoints, {
      color: routeCalc.detourRecommended ? '#38bdf8' : '#22c55e',
      weight: 6,
      opacity: 0.9,
      dashArray: routeCalc.detourRecommended ? '8, 8' : null,
      lineCap: 'round'
    });

    routeLayerRef.current.addLayer(polyline);
  }, [selectedDestination, userLocation, incidents, currentCampus]);

  const handleShareLocation = () => {
    const locString = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    navigator.clipboard.writeText(locString);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Map Control Bar */}
      <div className="glass-card rounded-3xl p-6 border border-blue-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          {/* Campus Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">Campus:</span>
            {CAMPUS_PRESETS.map((campus) => (
              <button
                key={campus.id}
                onClick={() => handleSwitchCampus(campus.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCampusId === campus.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>📍 {campus.shortName}</span>
              </button>
            ))}
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {currentCampus.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{currentCampus.address}</span>
            </p>
          </div>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto">
          {['all', 'critical', 'high', 'medium', 'low'].map((prio) => (
            <button
              key={prio}
              onClick={() => setFilterPriority(prio)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterPriority === prio
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leaflet Map Viewer */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-2 border border-blue-500/30 overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col">
          {/* Map Layer Switcher & Quick Navigation Bar (Top-Right of Map) */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-wrap items-center gap-2">
            {/* Map Styles */}
            <div className="flex items-center bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-2xl">
              <button
                onClick={() => switchMapStyle('google-streets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'google-streets'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Google Maps Standard Streets"
              >
                <span>🗺️ Google Streets</span>
              </button>

              <button
                onClick={() => switchMapStyle('google-hybrid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'google-hybrid'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Google Maps Satellite Imagery with Road Overlays"
              >
                <span>🛰️ Satellite</span>
              </button>

              <button
                onClick={() => switchMapStyle('osm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mapStyle === 'osm'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="OpenStreetMap Standard"
              >
                <span>🌐 OSM</span>
              </button>
            </div>

            {/* Quick Navigation Controls */}
            <div className="flex items-center bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-2xl">
              <button
                onClick={handleRecenterCampus}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                title="Zoom into Campus Center"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Campus Focus</span>
              </button>

              <button
                onClick={handleZoomToWorld}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 ml-1"
                title="Zoom Out to Entire Globe"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>World View</span>
              </button>

              <button
                onClick={handleLocateMe}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
                title="Locate My GPS Device"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full flex-1 min-h-[580px] rounded-2xl"></div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-6 left-6 z-[1000] glass-card bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 text-[11px] space-y-1.5 shadow-2xl hidden sm:block">
            <p className="font-bold text-white uppercase tracking-wider text-[10px] mb-1">Campus Legend</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500"></span>
              <span className="text-slate-300">Critical Hazard (Fire, Lift, Medical)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500"></span>
              <span className="text-slate-300">High Hazard (Fight, Live Wire)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500"></span>
              <span className="text-slate-300">Medium Hazard (Water, Street Light)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Your Live GPS Location</span>
            </div>
          </div>
        </div>

        {/* Right Safe Navigation & Emergency Center */}
        <div className="space-y-6">
          {/* Safe Route Calculator Card */}
          <div className="glass-card rounded-3xl p-6 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-base text-white">AI Safe Route Guide</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Landmark</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 focus:outline-none"
              >
                {currentCampus.landmarks.map((landmark) => (
                  <option key={landmark.id} value={landmark.id}>
                    {landmark.name}
                  </option>
                ))}
              </select>
            </div>

            {safeRouteData && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Distance:</span>
                  <span className="font-bold text-white font-mono">{safeRouteData.distanceMeters} meters</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Est. Walk Time:</span>
                  <span className="font-bold text-cyan-400 font-mono">~{safeRouteData.walkingTimeMinutes} mins</span>
                </div>

                <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
                  safeRouteData.detourRecommended
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{safeRouteData.detourRecommended ? 'AI Detour Active' : 'Direct Path Clear'}</span>
                  </div>
                  <p>{safeRouteData.advice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Emergency Actions */}
          <div className="glass-card rounded-3xl p-6 border border-red-500/30 space-y-3.5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Emergency Response
            </h3>

            {/* Instant SOS Button */}
            <button
              onClick={onTriggerSOS}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span>SEND EMERGENCY SOS</span>
            </button>

            {/* 1-Click Dial Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:1800226787"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                Call Security
              </a>

              <a
                href="tel:1800432584"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                Call Medical
              </a>
            </div>

            {/* Share Live Location */}
            <button
              onClick={handleShareLocation}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {copiedLocation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">GPS Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Share My Live GPS Location</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
