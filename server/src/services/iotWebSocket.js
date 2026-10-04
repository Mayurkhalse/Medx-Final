import { WebSocketServer, WebSocket } from 'ws';
import config from '../config/config.js';

let wss = null;
let simulatorInterval = null;
let simulatorActive = false;
let lastTelemetry = {
  ecg: 0,
  ppg: 0,
  bpm: 0,
  spo2: 0,
  timestamp: Date.now()
};

/**
 * Generates synthetic physiological telemetry matching ESP32 + MAX30105 + AD8232 ECG.
 */
let simPhase = 0;
function generateSimulatedPacket() {
  simPhase = (simPhase + 1) % 40; // 40 samples per cardiac cycle at 20Hz = 2 sec / 60 BPM or 1.3 sec at 75 BPM

  // Realistic P-Q-R-S-T ECG wave calculation
  let ecgBase = 1850;
  if (simPhase === 8) ecgBase += 120; // P wave
  else if (simPhase === 13) ecgBase -= 180; // Q wave
  else if (simPhase === 14) ecgBase += 1250; // R peak
  else if (simPhase === 15) ecgBase -= 350; // S wave
  else if (simPhase === 22 || simPhase === 23) ecgBase += 220; // T wave
  ecgBase += Math.floor((Math.random() - 0.5) * 40); // slight analog noise

  // Realistic PPG wave with dicrotic notch
  const ppgBase = Math.floor(
    75000 + 18000 * Math.sin((simPhase / 40) * 2 * Math.PI) +
    (simPhase > 20 ? 4000 * Math.sin(((simPhase - 20) / 20) * 2 * Math.PI) : 0) +
    (Math.random() - 0.5) * 800
  );

  const simulatedBpm = 74 + Math.floor(Math.sin(Date.now() / 15000) * 4);
  const simulatedSpo2 = 98;

  return {
    ecg: Math.max(0, Math.min(4095, ecgBase)),
    ppg: Math.max(0, ppgBase),
    bpm: simulatedBpm,
    spo2: simulatedSpo2,
    simulated: true,
    timestamp: Date.now()
  };
}

/**
 * Broadcasts a payload to all connected WebSocket clients.
 */
export function broadcastToClients(data) {
  if (!wss) return;
  const payloadStr = typeof data === 'string' ? data : JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payloadStr);
      } catch (err) {
        console.warn('[IoT WebSocket] Broadcast error:', err.message);
      }
    }
  });
}

/**
 * Starts the software simulator loop.
 */
export function startSimulator() {
  if (simulatorActive) return;
  simulatorActive = true;
  console.log('[IoT WebSocket] Hardware simulator activated (20 packets/sec).');

  simulatorInterval = setInterval(() => {
    const packet = generateSimulatedPacket();
    lastTelemetry = packet;
    broadcastToClients(packet);
  }, 50); // 50 ms matches ESP32 websocketInterval

  broadcastToClients({ type: 'SIMULATOR_STATE', active: true });
}

/**
 * Stops the software simulator loop.
 */
export function stopSimulator() {
  if (!simulatorActive) return;
  simulatorActive = false;
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
  console.log('[IoT WebSocket] Hardware simulator deactivated.');
  broadcastToClients({ type: 'SIMULATOR_STATE', active: false });
}

/**
 * Initialize and start the IoT WebSocket Server.
 */
export function startIotWebSocketServer() {
  const port = config.IOT_WS_PORT || 8080;

  try {
    wss = new WebSocketServer({
      host: '0.0.0.0',
      port
    });

    console.log(`[IoT WebSocket] Telemetry WebSocket Server listening on 0.0.0.0:${port}`);
    console.log(`[IoT WebSocket] ESP32 devices can stream to: ws://<server-ip>:${port}/`);

    wss.on('connection', (ws, req) => {
      const clientIp = req.socket.remoteAddress || 'unknown';
      console.log(`[IoT WebSocket] New connection from ${clientIp}. Total connected: ${wss.clients.size}`);

      // Send initial status and latest telemetry to newly connected client
      ws.send(JSON.stringify({
        type: 'CONNECTION_ACK',
        message: 'Connected to Med-X Real-Time IoT Telemetry Stream',
        simulatorActive,
        lastTelemetry,
        connectedClients: wss.clients.size
      }));

      ws.on('message', (message) => {
        try {
          const raw = message.toString();
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            return;
          }

          // Handle simulator control commands from web clients
          if (data.type === 'START_SIMULATOR') {
            startSimulator();
            return;
          }
          if (data.type === 'STOP_SIMULATOR') {
            stopSimulator();
            return;
          }
          if (data.type === 'GET_STATUS') {
            ws.send(JSON.stringify({
              type: 'STATUS_RESPONSE',
              simulatorActive,
              lastTelemetry,
              connectedClients: wss.clients.size
            }));
            return;
          }

          // Hardware stream payload from ESP32: { ecg, ppg, bpm, spo2 }
          if (data.ecg !== undefined || data.ppg !== undefined || data.bpm !== undefined) {
            lastTelemetry = {
              ecg: Number(data.ecg) || 0,
              ppg: Number(data.ppg) || 0,
              bpm: Number(data.bpm) || 0,
              spo2: Number(data.spo2) || 0,
              timestamp: Date.now()
            };

            // Broadcast to all clients
            broadcastToClients(lastTelemetry);
          }
        } catch (err) {
          console.warn('[IoT WebSocket] Message handling error:', err.message);
        }
      });

      ws.on('close', () => {
        console.log(`[IoT WebSocket] Connection closed. Remaining: ${wss.clients.size}`);
      });

      ws.on('error', (err) => {
        console.warn('[IoT WebSocket] Client socket error:', err.message);
      });
    });

    wss.on('error', (err) => {
      console.error(`[IoT WebSocket FATAL] Server error on port ${port}:`, err.message);
    });

    return wss;
  } catch (error) {
    console.error(`[IoT WebSocket] Failed to start WebSocket server on port ${port}:`, error.message);
    return null;
  }
}

/**
 * Graceful shutdown for the WebSocket Server.
 */
export function stopIotWebSocketServer() {
  stopSimulator();
  if (wss) {
    console.log('[IoT WebSocket] Closing WebSocket server...');
    wss.close(() => {
      console.log('[IoT WebSocket] Server closed.');
    });
    wss = null;
  }
}

export function getLatestTelemetry() {
  return lastTelemetry;
}

export default {
  startIotWebSocketServer,
  stopIotWebSocketServer,
  broadcastToClients,
  startSimulator,
  stopSimulator,
  getLatestTelemetry
};
