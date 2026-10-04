import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  FileText,
  Clock,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../../services/api.js';

export default function PatientLiveVitals({ onReportCreated, onNavigateToReports }) {
  // Connection & Telemetry State
  const [wsUrl, setWsUrl] = useState(`ws://${window.location.hostname || 'localhost'}:8080`);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [packetRate, setPacketRate] = useState(0);

  // Live Instantaneous Telemetry
  const [liveBpm, setLiveBpm] = useState(0);
  const [liveSpo2, setLiveSpo2] = useState(0);
  const [liveEcg, setLiveEcg] = useState(0);
  const [livePpg, setLivePpg] = useState(0);
  const [fingerDetected, setFingerDetected] = useState(true);
  const [leadConnected, setLeadConnected] = useState(true);

  // 1-Minute Monitoring Session State
  const [sessionState, setSessionState] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'COMPLETED' | 'SAVED'
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Refs for high-speed streaming without triggering React render loops
  const wsRef = useRef(null);
  const ecgCanvasRef = useRef(null);
  const ppgCanvasRef = useRef(null);
  const packetCountRef = useRef(0);
  const ecgHistoryRef = useRef([]);
  const ppgHistoryRef = useRef([]);
  const sessionSamplesRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const animFrameRef = useRef(null);
  const sweepXRef = useRef(0);

  // ============================================================
  // WebSocket Lifecycle & Packet Handling
  // ============================================================
  const connectWebSocket = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
    }

    setConnectionError('');
    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setConnectionError('');
        console.log('[IoT Monitor] Connected to WebSocket at', wsUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle system control messages
          if (data.type === 'SIMULATOR_STATE') {
            setIsSimulator(data.active);
            return;
          }
          if (data.type === 'CONNECTION_ACK' || data.type === 'STATUS_RESPONSE') {
            if (data.simulatorActive !== undefined) {
              setIsSimulator(data.simulatorActive);
            }
          }

          // Handle Telemetry packet
          if (data.ecg !== undefined || data.bpm !== undefined) {
            packetCountRef.current += 1;

            const ecg = Number(data.ecg) || 0;
            const ppg = Number(data.ppg) || 0;
            const bpm = Number(data.bpm) || 0;
            const spo2 = Number(data.spo2) || 0;

            setLiveEcg(ecg);
            setLivePpg(ppg);
            setLiveBpm(bpm);
            setLiveSpo2(spo2);

            // Sensor physical contacts
            const hasFinger = ppg >= 50000 || bpm > 0 || spo2 > 0;
            const hasLeads = ecg > 100;
            setFingerDetected(hasFinger);
            setLeadConnected(hasLeads);

            // Buffer for real-time oscilloscope
            ecgHistoryRef.current.push(ecg);
            if (ecgHistoryRef.current.length > 300) {
              ecgHistoryRef.current.shift();
            }

            ppgHistoryRef.current.push(ppg);
            if (ppgHistoryRef.current.length > 300) {
              ppgHistoryRef.current.shift();
            }

            // Accumulate in active 1-minute monitoring session
            if (sessionState === 'RUNNING') {
              sessionSamplesRef.current.push({
                bpm,
                spo2,
                ecg,
                ppg,
                valid: hasFinger && bpm > 30 && bpm < 220 && spo2 > 70
              });
            }
          }
        } catch {
          // ignore corrupted frame
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
        setConnectionError('Unable to connect to WebSocket server. Ensure Med-X backend is running on port 8080.');
      };
    } catch (err) {
      setConnectionError(err.message || 'WebSocket initialization failed.');
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Packet rate calculator (every 1 second)
    const rateInterval = setInterval(() => {
      setPacketRate(packetCountRef.current);
      packetCountRef.current = 0;
    }, 1000);

    return () => {
      clearInterval(rateInterval);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [wsUrl]);

  // ============================================================
  // Toggle Simulator Engine
  // ============================================================
  const toggleSimulator = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Local fallback simulation if server is offline
      runLocalSimulator();
      return;
    }

    if (isSimulator) {
      wsRef.current.send(JSON.stringify({ type: 'STOP_SIMULATOR' }));
      setIsSimulator(false);
    } else {
      wsRef.current.send(JSON.stringify({ type: 'START_SIMULATOR' }));
      setIsSimulator(true);
    }
  };

  // Local fallback if WebSocket port 8080 isn't yet connected
  const localSimRef = useRef(null);
  const runLocalSimulator = () => {
    if (localSimRef.current) {
      clearInterval(localSimRef.current);
      localSimRef.current = null;
      setIsSimulator(false);
      return;
    }

    setIsSimulator(true);
    setIsConnected(true);
    let phase = 0;

    localSimRef.current = setInterval(() => {
      phase = (phase + 1) % 40;
      let ecg = 1850;
      if (phase === 8) ecg += 120;
      else if (phase === 13) ecg -= 180;
      else if (phase === 14) ecg += 1250;
      else if (phase === 15) ecg -= 350;
      else if (phase === 22 || phase === 23) ecg += 220;
      ecg += Math.floor((Math.random() - 0.5) * 40);

      const ppg = Math.floor(
        75000 + 18000 * Math.sin((phase / 40) * 2 * Math.PI) +
        (phase > 20 ? 4000 * Math.sin(((phase - 20) / 20) * 2 * Math.PI) : 0) +
        (Math.random() - 0.5) * 800
      );

      const bpm = 74 + Math.floor(Math.sin(Date.now() / 15000) * 4);
      const spo2 = 98;

      setLiveEcg(ecg);
      setLivePpg(ppg);
      setLiveBpm(bpm);
      setLiveSpo2(spo2);
      setFingerDetected(true);
      setLeadConnected(true);

      ecgHistoryRef.current.push(ecg);
      if (ecgHistoryRef.current.length > 300) ecgHistoryRef.current.shift();

      ppgHistoryRef.current.push(ppg);
      if (ppgHistoryRef.current.length > 300) ppgHistoryRef.current.shift();

      if (sessionState === 'RUNNING') {
        sessionSamplesRef.current.push({
          bpm,
          spo2,
          ecg,
          ppg,
          valid: true
        });
      }
    }, 50);
  };

  // ============================================================
  // Real-Time Canvas Oscilloscopes (60 FPS Medical Display)
  // ============================================================
  useEffect(() => {
    let running = true;

    const renderWaveforms = () => {
      if (!running) return;

      // 1. ECG Canvas
      const ecgCanvas = ecgCanvasRef.current;
      if (ecgCanvas) {
        const ctx = ecgCanvas.getContext('2d');
        const width = ecgCanvas.width;
        const height = ecgCanvas.height;

        // Clear with dark medical monitor canvas
        ctx.fillStyle = '#090D16';
        ctx.fillRect(0, 0, width, height);

        // Draw cardiac grid
        ctx.strokeStyle = '#152238';
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw continuous ECG waveform
        const ecgData = ecgHistoryRef.current;
        if (ecgData.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = '#10B981'; // Medical CRT Neon Green
          ctx.lineWidth = 2.2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
          ctx.shadowBlur = 4;

          const minVal = 800;
          const maxVal = 3500;
          const range = maxVal - minVal;

          for (let i = 0; i < ecgData.length; i++) {
            const x = (i / (ecgData.length - 1)) * width;
            const norm = (ecgData[i] - minVal) / range;
            const y = height - (norm * (height - 30) + 15);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }

        // Sweep cursor line
        sweepXRef.current = (sweepXRef.current + 2) % width;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sweepXRef.current, 0);
        ctx.lineTo(sweepXRef.current, height);
        ctx.stroke();
      }

      // 2. PPG Canvas
      const ppgCanvas = ppgCanvasRef.current;
      if (ppgCanvas) {
        const ctx = ppgCanvas.getContext('2d');
        const width = ppgCanvas.width;
        const height = ppgCanvas.height;

        ctx.fillStyle = '#090D16';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#142033';
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw continuous PPG pulse wave
        const ppgData = ppgHistoryRef.current;
        if (ppgData.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = '#06B6D4'; // Cyan Plethysmograph Wave
          ctx.lineWidth = 2.2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
          ctx.shadowBlur = 4;

          const minVal = 40000;
          const maxVal = 110000;
          const range = maxVal - minVal;

          for (let i = 0; i < ppgData.length; i++) {
            const x = (i / (ppgData.length - 1)) * width;
            const norm = (ppgData[i] - minVal) / range;
            const y = height - (Math.max(0, Math.min(1, norm)) * (height - 30) + 15);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderWaveforms);
    };

    animFrameRef.current = requestAnimationFrame(renderWaveforms);

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // ============================================================
  // 1-Minute Monitoring Session Controller
  // ============================================================
  const startMonitoring = () => {
    sessionSamplesRef.current = [];
    setSessionSummary(null);
    setSaveSuccess(null);
    setSaveError(null);
    setSecondsRemaining(60);
    setSessionState('RUNNING');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          finishMonitoringSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopMonitoring = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (sessionSamplesRef.current.length > 10) {
      finishMonitoringSession();
    } else {
      setSessionState('IDLE');
      setSecondsRemaining(60);
    }
  };

  const finishMonitoringSession = () => {
    setSessionState('COMPLETED');
    const samples = sessionSamplesRef.current;

    // Filter valid readings
    const validSamples = samples.filter((s) => s.valid);
    const validBpms = validSamples.map((s) => s.bpm).filter((v) => v > 0);
    const validSpo2s = validSamples.map((s) => s.spo2).filter((v) => v > 0);

    const avgBpm = validBpms.length > 0
      ? Math.round(validBpms.reduce((a, b) => a + b, 0) / validBpms.length)
      : (liveBpm > 0 ? liveBpm : 75);

    const minBpm = validBpms.length > 0 ? Math.min(...validBpms) : avgBpm;
    const maxBpm = validBpms.length > 0 ? Math.max(...validBpms) : avgBpm;

    const avgSpo2 = validSpo2s.length > 0
      ? Math.round(validSpo2s.reduce((a, b) => a + b, 0) / validSpo2s.length)
      : (liveSpo2 > 0 ? liveSpo2 : 98);

    const minSpo2 = validSpo2s.length > 0 ? Math.min(...validSpo2s) : avgSpo2;
    const maxSpo2 = validSpo2s.length > 0 ? Math.max(...validSpo2s) : avgSpo2;

    const ecgVals = samples.map((s) => s.ecg).filter((v) => v > 0);
    const avgEcg = ecgVals.length > 0
      ? Math.round(ecgVals.reduce((a, b) => a + b, 0) / ecgVals.length)
      : 1850;

    const ppgVals = samples.map((s) => s.ppg).filter((v) => v > 0);
    const avgPpg = ppgVals.length > 0
      ? Math.round(ppgVals.reduce((a, b) => a + b, 0) / ppgVals.length)
      : 80000;

    // Clinical interpretation
    let clinicalVerdict = 'Optimal Physiological State';
    let riskTier = 'Low';
    if (avgSpo2 < 90 || avgBpm > 130 || avgBpm < 45) {
      clinicalVerdict = 'Critical Vitals Alert: Immediate Clinical Review Recommended';
      riskTier = 'Critical';
    } else if (avgSpo2 < 95 || avgBpm > 100 || avgBpm < 60) {
      clinicalVerdict = 'Borderline Physiological Readings Observed';
      riskTier = 'Moderate';
    }

    const summary = {
      durationSeconds: 60 - secondsRemaining || 60,
      totalSamples: samples.length,
      validSamplesCount: validSamples.length,
      avgBpm,
      minBpm,
      maxBpm,
      avgSpo2,
      minSpo2,
      maxSpo2,
      avgEcg,
      avgPpg,
      clinicalVerdict,
      riskTier,
      timestamp: new Date().toLocaleTimeString()
    };

    setSessionSummary(summary);

    // Automatically trigger saving to database
    saveSessionToDatabase(summary);
  };

  // ============================================================
  // Save to Medical Reports & Database
  // ============================================================
  const saveSessionToDatabase = async (summaryData = sessionSummary) => {
    if (!summaryData) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await api.post('/reports/iot', {
        durationSeconds: summaryData.durationSeconds || 60,
        avgBpm: summaryData.avgBpm,
        minBpm: summaryData.minBpm,
        maxBpm: summaryData.maxBpm,
        avgSpo2: summaryData.avgSpo2,
        minSpo2: summaryData.minSpo2,
        maxSpo2: summaryData.maxSpo2,
        avgEcg: summaryData.avgEcg,
        avgPpg: summaryData.avgPpg,
        totalSamples: summaryData.totalSamples,
        reportName: `IoT Telemetry Vital Screening (${summaryData.durationSeconds}s Continuous Session)`,
        sessionNotes: `Automated 1-minute telemetric screening via ESP32, MAX30105 Optical PPG & AD8232 ECG. Mean Heart Rate: ${summaryData.avgBpm} BPM (Range: ${summaryData.minBpm}-${summaryData.maxBpm}). Mean SpO2: ${summaryData.avgSpo2}% (Range: ${summaryData.minSpo2}-${summaryData.maxSpo2}%). Total captured samples: ${summaryData.totalSamples}.`
      });

      setSaveSuccess(res.data.report || res.data);
      setSessionState('SAVED');
      if (onReportCreated) onReportCreated(res.data.report || res.data);
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || err.message || 'Failed to save vital session to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Color & Badge indicators
  const getBpmBadge = (bpm) => {
    if (bpm === 0) return { label: 'Awaiting Signal', bg: '#F1F5F9', color: '#64748B' };
    if (bpm > 100) return { label: 'Tachycardia (Elevated)', bg: '#FEF2F2', color: '#DC2626' };
    if (bpm < 60) return { label: 'Bradycardia (Low)', bg: '#FFFBEB', color: '#D97706' };
    return { label: 'Normal Sinus Rhythm', bg: '#ECFDF5', color: '#059669' };
  };

  const getSpo2Badge = (spo2) => {
    if (spo2 === 0) return { label: 'Awaiting Finger', bg: '#F1F5F9', color: '#64748B' };
    if (spo2 < 90) return { label: 'Critical Hypoxia', bg: '#FEF2F2', color: '#DC2626' };
    if (spo2 < 95) return { label: 'Mild Hypoxemia', bg: '#FFFBEB', color: '#D97706' };
    return { label: 'Optimal Saturation', bg: '#EFF6FF', color: '#2563EB' };
  };

  const bpmBadge = getBpmBadge(sessionSummary?.avgBpm || liveBpm);
  const spo2Badge = getSpo2Badge(sessionSummary?.avgSpo2 || liveSpo2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 1. Header Banner & Device Telemetry Bar */}
      <div className="medx-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--medx-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--medx-radius-md)',
              background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}>
              <Activity size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                  Real-Time IoT Vital Monitor
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: isConnected ? '#ECFDF5' : '#FEF2F2',
                  color: isConnected ? '#059669' : '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: `1px solid ${isConnected ? '#A7F3D0' : '#FECACA'}`
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#10B981' : '#EF4444',
                    display: 'inline-block',
                    animation: isConnected ? 'pulse 2s infinite' : 'none'
                  }} />
                  {isConnected ? (isSimulator ? 'Simulator Active' : 'IoT Device Live') : 'Disconnected'}
                </span>
              </div>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
                Continuous biometrics streamed via ESP32-S3 microcontroller, MAX30105 Optical PPG & AD8232 ECG.
              </p>
            </div>
          </div>

          {/* Quick Hardware Controls & Simulator Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={toggleSimulator}
              className="medx-button"
              style={{
                backgroundColor: isSimulator ? '#F5F3FF' : '#F8FAFC',
                color: isSimulator ? '#6D28D9' : 'var(--medx-text-secondary)',
                border: `1px solid ${isSimulator ? '#C4B5FD' : 'var(--medx-border)'}`,
                padding: '0.5rem 0.85rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
              title="Toggle software hardware simulation when physical ESP32 is offline"
            >
              <Zap size={15} color={isSimulator ? '#7C3AED' : '#64748B'} />
              {isSimulator ? 'Simulation Running' : 'Simulate Hardware'}
            </button>

            <button
              onClick={connectWebSocket}
              className="medx-button"
              style={{
                backgroundColor: '#F8FAFC',
                color: 'var(--medx-text-secondary)',
                border: '1px solid var(--medx-border)',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
              title="Reconnect WebSocket"
            >
              <RefreshCw size={15} />
              Reconnect WS
            </button>
          </div>
        </div>

        {/* Telemetry Hardware Diagnostics Strip */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--medx-surface-muted)',
          borderRadius: 'var(--medx-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--medx-text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <strong>Stream Target:</strong> <code>{wsUrl}</code>
            </div>
            <div>
              <strong>Data Rate:</strong> <span style={{ color: 'var(--medx-navy)', fontWeight: 600 }}>{packetRate} pkts/sec</span>
            </div>
            <div>
              <strong>Finger Contact:</strong>{' '}
              <span style={{
                color: fingerDetected ? '#059669' : '#D97706',
                fontWeight: 600
              }}>
                {fingerDetected ? 'Sensor Engaged' : 'No Finger Detected (Place finger on MAX30105)'}
              </span>
            </div>
            <div>
              <strong>ECG Leads:</strong>{' '}
              <span style={{
                color: leadConnected ? '#059669' : '#DC2626',
                fontWeight: 600
              }}>
                {leadConnected ? 'Leads Attached' : 'Leads Off'}
              </span>
            </div>
          </div>

          {sessionState === 'RUNNING' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#DC2626',
              fontWeight: 700,
              backgroundColor: '#FEF2F2',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 1s infinite' }} />
              RECORDING 1-MIN VITAL SESSION ({secondsRemaining}s)
            </div>
          )}
        </div>

        {connectionError && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--medx-radius-md)',
            color: '#B91C1C',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{connectionError}</span>
          </div>
        )}
      </div>

      {/* 2. Primary 1-Minute Monitoring Action Panel */}
      <div className="medx-card" style={{
        background: sessionState === 'RUNNING'
          ? 'linear-gradient(to right, #FAF5FF, #EFF6FF)'
          : 'var(--medx-surface)',
        border: sessionState === 'RUNNING'
          ? '2px solid #7C3AED'
          : '1px solid var(--medx-border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
              1-Minute Clinical Vital Recording
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
              Captures high-frequency continuous heart rate, SpO2, and cardiac waveforms for 60 seconds, computes official averages, and synchronizes to your medical records.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {sessionState === 'RUNNING' ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--medx-radius-md)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0'
                }}>
                  <Clock size={20} color="#7C3AED" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Remaining
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'var(--medx-font-mono)' }}>
                      00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                    </div>
                  </div>
                </div>

                <button
                  onClick={stopMonitoring}
                  className="medx-button"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700,
                    borderRadius: 'var(--medx-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <Square size={18} />
                  Finish Early & Save
                </button>
              </>
            ) : (
              <button
                onClick={startMonitoring}
                className="medx-button"
                style={{
                  backgroundColor: 'var(--medx-primary)',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 'var(--medx-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <Play size={20} fill="#FFFFFF" />
                Start 1-Minute Monitoring
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar during monitoring */}
        {sessionState === 'RUNNING' && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#E2E8F0',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${((60 - secondsRemaining) / 60) * 100}%`,
                background: 'linear-gradient(90deg, #7C3AED, #2563EB)',
                transition: 'width 1s linear'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--medx-text-secondary)'
            }}>
              <span>Progress: {Math.round(((60 - secondsRemaining) / 60) * 100)}%</span>
              <span>Samples Gathered: {sessionSamplesRef.current.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Real-Time Vitals Numerical Readout Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Heart Rate Card */}
        <div className="medx-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                Heart Rate (BPM)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--medx-navy)',
                  fontFamily: 'var(--medx-font-mono)'
                }}>
                  {liveBpm > 0 ? liveBpm : '--'}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                  BPM
                </span>
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart
                size={24}
                fill={liveBpm > 0 ? '#EF4444' : 'none'}
                style={{
                  animation: liveBpm > 0 ? `pulse ${Math.max(0.4, 60 / (liveBpm || 75))}s infinite` : 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: bpmBadge.bg,
              color: bpmBadge.color
            }}>
              {bpmBadge.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
              Target: 60–100 BPM
            </span>
          </div>
        </div>

        {/* SpO2 Card */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                Oxygen Saturation (SpO2)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--medx-navy)',
                  fontFamily: 'var(--medx-font-mono)'
                }}>
                  {liveSpo2 > 0 ? liveSpo2 : '--'}
                </span>
                <span style={{ fontSize: '1.25rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                  %
                </span>
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplets size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: spo2Badge.bg,
              color: spo2Badge.color
            }}>
              {spo2Badge.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
              Standard: ≥ 95%
            </span>
          </div>
        </div>

        {/* ECG Baseline & Lead Status */}
        <div className="medx-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--medx-text-secondary)', textTransform: 'uppercase' }}>
                Analog ECG Voltage
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--medx-navy)',
                  fontFamily: 'var(--medx-font-mono)'
                }}>
                  {liveEcg > 0 ? liveEcg : '--'}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--medx-text-secondary)', fontWeight: 600 }}>
                  ADC (12-bit)
                </span>
              </div>
            </div>

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: leadConnected ? '#ECFDF5' : '#FEF2F2',
              color: leadConnected ? '#059669' : '#DC2626'
            }}>
              {leadConnected ? 'Lead I (Normal)' : 'Lead Off (Check Electrodes)'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
              Front-End: AD8232
            </span>
          </div>
        </div>
      </div>

      {/* 4. Live Oscilloscope Waveforms (ECG & PPG) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ECG Canvas Box */}
        <div className="medx-card" style={{ padding: '1.25rem', backgroundColor: '#070B14', border: '1px solid #1E293B' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <strong style={{ fontSize: '0.9rem', color: '#10B981', letterSpacing: '0.05em' }}>
                ELECTROCARDIOGRAM (ECG) — CONTINUOUS LEAD I
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--medx-font-mono)' }}>
              SPEED: 25 mm/s | GAIN: 10 mm/mV | 20 Hz
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden' }}>
            <canvas
              ref={ecgCanvasRef}
              width={900}
              height={220}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            {!leadConnected && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                color: '#FFFFFF',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(4px)'
              }}>
                <AlertTriangle size={18} />
                LEADS DETACHED — CHECK ECG ELECTRODE PADS
              </div>
            )}
          </div>
        </div>

        {/* PPG Pulse Wave Canvas Box */}
        <div className="medx-card" style={{ padding: '1.25rem', backgroundColor: '#070B14', border: '1px solid #1E293B' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06B6D4' }} />
              <strong style={{ fontSize: '0.9rem', color: '#06B6D4', letterSpacing: '0.05em' }}>
                PHOTOPLETHYSMOGRAM (PPG) — OPTICAL PULSE WAVEFORM
              </strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--medx-font-mono)' }}>
              SENSOR: MAX30105 | INFRARED ABSORPTION
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
            <canvas
              ref={ppgCanvasRef}
              width={900}
              height={180}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            {!fingerDetected && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(217, 119, 6, 0.85)',
                color: '#FFFFFF',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(4px)'
              }}>
                <Info size={18} />
                NO FINGER DETECTED — PLACE INDEX FINGER GENTLY ON SENSOR
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. 1-Minute Session Summary Card & Database Persistence Modal */}
      {sessionSummary && (
        <div className="medx-card" style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #10B981',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
          padding: '1.75rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--medx-border)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                backgroundColor: '#ECFDF5',
                color: '#059669',
                padding: '0.6rem',
                borderRadius: '50%'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--medx-navy)', margin: 0 }}>
                  1-Minute Session Completed & Evaluated
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--medx-text-secondary)' }}>
                  Recorded at {sessionSummary.timestamp} • Duration: {sessionSummary.durationSeconds}s • Samples: {sessionSummary.totalSamples}
                </p>
              </div>
            </div>

            <span style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: sessionSummary.riskTier === 'Critical' ? '#FEF2F2' : (sessionSummary.riskTier === 'Moderate' ? '#FFFBEB' : '#ECFDF5'),
              color: sessionSummary.riskTier === 'Critical' ? '#DC2626' : (sessionSummary.riskTier === 'Moderate' ? '#D97706' : '#059669')
            }}>
              Risk Tier: {sessionSummary.riskTier}
            </span>
          </div>

          {/* Average Metrics 4-Col Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                1-Min Average Heart Rate
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626', margin: '0.25rem 0' }}>
                {sessionSummary.avgBpm} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--medx-text-secondary)' }}>BPM</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                Range: {sessionSummary.minBpm} – {sessionSummary.maxBpm} BPM
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                1-Min Average SpO2
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563EB', margin: '0.25rem 0' }}>
                {sessionSummary.avgSpo2}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                Range: {sessionSummary.minSpo2}% – {sessionSummary.maxSpo2}%
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Average ECG Voltage
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0' }}>
                {sessionSummary.avgEcg} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--medx-text-secondary)' }}>ADC</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)' }}>
                Valid Waveform Baseline
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--medx-surface-muted)', padding: '1rem', borderRadius: 'var(--medx-radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Clinical Assessment
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--medx-navy)', marginTop: '0.4rem' }}>
                {sessionSummary.clinicalVerdict}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <ShieldCheck size={14} /> Normal physiological limits
              </span>
            </div>
          </div>

          {/* Database Synchronization Status Alert */}
          {saveSuccess ? (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--medx-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Check size={20} color="#059669" />
                <div>
                  <strong style={{ color: '#065F46' }}>Saved to Medical Reports & Patient Database!</strong>
                  <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
                    Diagnostic report logged under ID <code>{saveSuccess.reportId || saveSuccess._id}</code> with source tag <code>iot_device</code>.
                  </div>
                </div>
              </div>

              {onNavigateToReports && (
                <button
                  onClick={onNavigateToReports}
                  className="medx-button"
                  style={{
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={15} />
                  View in My Reports
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={() => saveSessionToDatabase()}
                disabled={isSaving}
                className="medx-button"
                style={{
                  backgroundColor: 'var(--medx-primary)',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {isSaving ? 'Saving to Database...' : 'Save to Medical Records'}
              </button>
            </div>
          )}

          {saveError && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--medx-radius-md)',
              color: '#B91C1C',
              fontSize: '0.8125rem'
            }}>
              {saveError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
