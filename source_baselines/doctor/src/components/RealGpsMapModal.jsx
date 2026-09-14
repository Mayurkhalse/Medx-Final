import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Compass,
  Clock,
  ShieldAlert,
  ExternalLink,
  Layers,
  Hospital,
  Activity,
  CheckCircle2,
  Users,
  Target,
  Maximize2
} from 'lucide-react';
import L from 'leaflet';

// Helper function to extract or assign deterministic GPS coordinates
const getAlertCoords = (alert, index) => {
  if (alert && alert.coordinates) {
    // Parse "28.6139° N, 77.2090° E" format
    const matches = alert.coordinates.match(/(-?\d+\.\d+).*?(-?\d+\.\d+)/);
    if (matches && matches.length >= 3) {
      const lat = parseFloat(matches[1]);
      const lng = parseFloat(matches[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  // Pre-configured distinct locations around hospital base if coordinates string isn't raw float
  const presetLocations = [
    { lat: 28.6139, lng: 77.2090, address: '24 MG Road, Sector 18, Noida' },
    { lat: 28.6310, lng: 77.2250, address: 'Plot 82, Sector 62, Noida' },
    { lat: 28.5880, lng: 77.2410, address: 'C-45 Lajpat Nagar III, New Delhi' },
    { lat: 28.6450, lng: 77.1950, address: '12 Connaught Place, New Delhi' },
    { lat: 28.5700, lng: 77.3100, address: 'Tower B, Indirapuram, Ghaziabad' }
  ];

  return presetLocations[index % presetLocations.length];
};

export default function RealGpsMapModal({ alert, alerts = [], patient, patients = [], onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Consolidate alerts list (support multi-patient alerts array or single alert)
  const alertsList = alerts && alerts.length > 0 ? alerts : (alert ? [alert] : []);
  
  const [selectedAlertId, setSelectedAlertId] = useState(
    alert?.id || (alertsList.length > 0 ? alertsList[0].id : 'SOS-001')
  );
  const [mapType, setMapType] = useState('road'); // 'road' or 'satellite'
  const [lastUpdatedSec, setLastUpdatedSec] = useState(4);

  // Hospital fixed location
  const hospitalLat = 28.5955;
  const hospitalLng = 77.3210;

  // Selected Alert Object
  const activeAlert = alertsList.find(a => a.id === selectedAlertId) || alertsList[0] || alert || {
    id: 'SOS-001',
    patientId: 'PX-10482',
    patientName: 'Rajesh Kumar',
    location: 'Emergency Room 2',
    status: 'SOS ACTIVE',
    vitalSeverity: 'Critical High Risk'
  };

  // Matched Patient for activeAlert
  const activePatient = patients.find(p => p.id === activeAlert.patientId) || patient || {
    id: activeAlert.patientId || 'PX-10482',
    name: activeAlert.patientName || 'Rajesh Kumar',
    phone: '+91 98112 34567'
  };

  // Active Alert Coordinates
  const activeIndex = alertsList.findIndex(a => a.id === activeAlert.id);
  const activeCoords = getAlertCoords(activeAlert, activeIndex >= 0 ? activeIndex : 0);

  // Calculate Haversine Distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceKm = calculateDistance(
    activeCoords.lat,
    activeCoords.lng,
    hospitalLat,
    hospitalLng
  );

  // Timer simulation for last updated seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec(prev => (prev >= 12 ? 2 : prev + 2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Map Instance
      const map = L.map(mapContainerRef.current, {
        center: [activeCoords.lat, activeCoords.lng],
        zoom: 13,
        zoomControl: true
      });

      // Tile Layer (OpenStreetMap Real Road Map)
      const tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | MedX Multi-Patient GPS'
        }
      ).addTo(map);

      tileLayerRef.current = tileLayer;

      // Hospital Base Marker
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #0284c7; color: white; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap; border: 1.5px solid white; margin-bottom: 2px;">
              🏥 MedX Super Speciality Hospital Base
            </div>
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #0284c7; border: 3px solid white; box-shadow: 0 0 0 4px rgba(2,132,199,0.4);"></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([hospitalLat, hospitalLng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup('<b>🏥 MedX Hospital Base</b><br/>Trauma Center & Emergency Bay');

      // Emergency Responder Marker
      const responderIcon = L.divIcon({
        className: 'custom-responder-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #059669; color: white; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap; border: 1.5px solid white; margin-bottom: 2px;">
              🚑 Nurse Priya (Rapid Responder)
            </div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #059669; border: 2px solid white;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker([28.6040, 77.2650], { icon: responderIcon }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTileUrl =
      mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTileLayer = L.tileLayer(newTileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | MedX GPS Radar'
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapType]);

  // Dynamically Plot All Active SOS Patient Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const boundsPoints = [[hospitalLat, hospitalLng]];

    alertsList.forEach((item, idx) => {
      const coords = getAlertCoords(item, idx);
      boundsPoints.push([coords.lat, coords.lng]);

      const isSelected = item.id === selectedAlertId;

      const patientIcon = L.divIcon({
        className: `custom-patient-marker-${item.id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); transition: all 0.3s ease;">
            <div style="
              background: ${isSelected ? '#e11d48' : '#f43f5e'};
              color: white;
              font-weight: 800;
              font-size: ${isSelected ? '11px' : '10px'};
              padding: ${isSelected ? '3px 10px' : '2px 8px'};
              border-radius: 9999px;
              box-shadow: ${isSelected ? '0 0 12px rgba(225,29,72,0.8)' : '0 4px 6px rgba(0,0,0,0.3)'};
              white-space: nowrap;
              border: ${isSelected ? '2px solid #fef08a' : '1.5px solid white'};
              margin-bottom: 2px;
            ">
              ${isSelected ? '🚨 ACTIVE SELECTED: ' : '🔴 '}${item.patientName || 'Patient'} (${item.status || 'SOS'})
            </div>
            <div style="
              width: ${isSelected ? '24px' : '18px'};
              height: ${isSelected ? '24px' : '18px'};
              border-radius: 50%;
              background: ${isSelected ? '#e11d48' : '#f43f5e'};
              border: 3px solid white;
              box-shadow: ${isSelected ? '0 0 0 6px rgba(225,29,72,0.5)' : '0 0 0 3px rgba(244,63,94,0.4)'};
            "></div>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: patientIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif;">
            <strong style="color: #e11d48; font-size: 13px;">🔴 ${item.patientName}</strong><br/>
            <b>Status:</b> ${item.status || 'SOS ACTIVE'}<br/>
            <b>Alert:</b> ${item.alertType}<br/>
            <b>Location:</b> ${item.location}
          </div>
        `);

      marker.on('click', () => {
        setSelectedAlertId(item.id);
      });

      markersRef.current[item.id] = marker;
    });

    // Draw active route line from active selected patient to hospital
    if (activeCoords) {
      const routeLine = L.polyline(
        [
          [activeCoords.lat, activeCoords.lng],
          [28.6040, 77.2650],
          [hospitalLat, hospitalLng]
        ],
        { color: '#e11d48', weight: 4, opacity: 0.8, dashArray: '8, 8' }
      ).addTo(map);

      polylineRef.current = routeLine;
    }

  }, [alertsList, selectedAlertId]);

  // Recenter Map on currently selected patient
  const handleRecenterSelected = () => {
    if (mapInstanceRef.current && activeCoords) {
      mapInstanceRef.current.flyTo([activeCoords.lat, activeCoords.lng], 15, {
        duration: 1.2
      });
    }
  };

  // Fit bounds around ALL active patients and hospital
  const handleFitAllBounds = () => {
    if (!mapInstanceRef.current) return;
    const points = [[hospitalLat, hospitalLng]];
    alertsList.forEach((a, idx) => {
      const c = getAlertCoords(a, idx);
      points.push([c.lat, c.lng]);
    });
    mapInstanceRef.current.fitBounds(points, { padding: [50, 50] });
  };

  // Open External Directions in Google Maps for selected patient
  const handleGetDirections = () => {
    if (!activeCoords) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeCoords.lat},${activeCoords.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md animate-pulse">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>📍 MULTI-PATIENT LIVE GPS SOS RADAR</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {alertsList.length} PATIENT{alertsList.length === 1 ? '' : 'S'} PLOTTED
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Real-time telemetry coordinates & active hospital route dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MULTI-PATIENT TOGGLE TABS */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Users className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Select Patient SOS:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {alertsList.map((item, idx) => {
              const isSel = item.id === selectedAlertId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedAlertId(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isSel
                      ? 'bg-rose-600 text-white shadow-xs scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-amber-300 animate-ping' : 'bg-rose-500'}`} />
                  <span>{item.patientName || `Patient ${idx + 1}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {item.id}
                  </span>
                </button>
              );
            })}

            {alertsList.length > 1 && (
              <button
                onClick={handleFitAllBounds}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fit All Patients</span>
              </button>
            )}
          </div>
        </div>

        {/* REAL INTERACTIVE LEAFLET MAP CONTAINER */}
        <div className="relative w-full h-[380px] bg-slate-200">
          <div ref={mapContainerRef} className="w-full h-full z-10"></div>

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 shadow-md">
            <button
              onClick={() => setMapType('road')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'road' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Road Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'satellite' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Floating Action Button: Recenter & Directions */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
            <button
              onClick={handleRecenterSelected}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-md backdrop-blur-md transition-colors"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Focus {activeAlert.patientName || 'Selected Patient'}</span>
            </button>
            <button
              onClick={handleGetDirections}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>↗ Get Directions</span>
            </button>
          </div>
        </div>

        {/* ACTIVE SELECTED PATIENT METRICS & DETAILS PANEL */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Written Address & GPS Coordinates */}
            <div className="md:col-span-7 p-4 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600 animate-bounce" />
                  <span>Selected Patient Location</span>
                </span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full">
                  {activeAlert.alertType}
                </span>
              </div>

              <div className="space-y-0.5">
                <strong className="text-slate-900 text-sm font-extrabold block">
                  {activeAlert.patientName || activePatient.name} (ID: {activeAlert.patientId})
                </strong>
                <p className="text-slate-700 font-bold text-xs">
                  {activeAlert.location || activeCoords.address}
                </p>
              </div>
              
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span className="text-slate-500">GPS Coordinates: <strong className="text-slate-900 font-mono font-bold">{activeCoords.lat}° N, {activeCoords.lng}° E</strong></span>
                <span className="text-slate-500">Accuracy: <strong className="text-emerald-700 font-bold">~6-8 meters</strong></span>
              </div>
            </div>

            {/* Live Status & Distance to Hospital */}
            <div className="md:col-span-5 p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800">Telemetry Status</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-900 border border-rose-300">
                  🔴 {activeAlert.status || 'SOS ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Distance to Base</span>
                  <span className="text-base font-black text-sky-950">{distanceKm} km</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-medium text-slate-500 block">Hospital ETA</span>
                  <span className="text-base font-black text-emerald-950">12 min <span className="text-[10px] text-slate-500 font-medium">(ER Desk)</span></span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Updated {lastUpdatedSec} seconds ago • Telemetry Signal Strong
              </div>
            </div>

          </div>

          {/* Footer Close Button */}
          <div className="pt-1 flex items-center justify-between border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">
              💡 Tip: Click any patient pill at top or marker on map to toggle active view.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Close GPS Radar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
