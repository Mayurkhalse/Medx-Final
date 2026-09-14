import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Phone, User } from 'lucide-react';

export default function ActivePhoneCallModal({ callData, onClose }) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!callData) return null;

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 text-center space-y-6 relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-rose-500/10 pointer-events-none" />

        {/* Call Status & Timer Header */}
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>HD Voice Line Connected</span>
          </div>
          <p className="text-3xl font-mono font-black text-white pt-2">{formatDuration(callDuration)}</p>
        </div>

        {/* Patient Photo Avatar & Details */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sky-500 shadow-xl shadow-sky-500/20">
              <img
                src={callData.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'}
                alt={callData.name || 'Patient'}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs shadow-md">
              <Phone className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">{callData.name || 'Patient'}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{callData.phone || '+91 98112 34567'}</p>
            {callData.bloodGroup && (
              <p className="text-[11px] text-sky-400 font-semibold mt-1">
                {callData.age ? `${callData.age} Yrs • ` : ''}Blood Group: {callData.bloodGroup}
              </p>
            )}
          </div>
        </div>

        {/* Simulated Equalizer Sound Wave */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 h-8">
          {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
            <span
              key={i}
              className={`w-1 bg-sky-400 rounded-full transition-all duration-300 ${
                isMuted ? 'h-1 bg-slate-700' : 'animate-pulse'
              }`}
              style={{ height: isMuted ? '4px' : `${h}%` }}
            />
          ))}
        </div>

        {/* Interactive Call Controls */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-2">
          {/* Mute Microphone */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
              isMuted ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px] font-bold">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Speakerphone */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
              isSpeakerOn ? 'bg-sky-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px] font-bold">{isSpeakerOn ? 'Speaker' : 'Earpiece'}</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center gap-1 shadow-lg shadow-rose-600/40 transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-[10px] font-bold">End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
}
