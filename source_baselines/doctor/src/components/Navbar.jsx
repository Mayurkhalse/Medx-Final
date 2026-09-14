import React, { useState, useEffect } from 'react';
import logo from '../assets/jankotilogo1.png';
import {
  Activity,
  Calendar,
  Users,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Stethoscope,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  doctorProfile,
  searchQuery,
  setSearchQuery,
  unreadMessagesCount,
  emergencyCount,
  onOpenGlobalSearch,
  isMuted,
  isPlayingAudio,
  onToggleAudioMute,
  notificationPermission,
  onRequestNotificationPermission
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'emergency', label: 'Emergency SOS', icon: AlertTriangle, badge: emergencyCount, isEmergency: true },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <nav className="navbar shadow-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top Tier: Logo, Controls, Live Clock & User Profile */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100/80 gap-3">
          
          {/* Jankoti Brand Logo & Portal Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
            aria-label="Home"
          >
            <img src={logo} alt="Jankoti Logo" className="navbar-logo-image h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Med<span className="text-purple-600">X</span>
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 hidden sm:inline-block">
                  Doctor Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Clinical Workstation</p>
            </div>
          </div>

          {/* Action Controls & Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Live Clock Badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-800">
              <Clock className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {formattedDate}
                </div>
                <div className="font-mono text-xs font-extrabold text-purple-300 leading-tight">
                  {formattedTime}
                </div>
              </div>
            </div>

            {/* Emergency SOS Badge */}
            {emergencyCount > 0 && (
              <button
                onClick={() => setActiveTab('emergency')}
                className="btn btn-danger btn-sm animate-pulse"
                title="Click to open Active Emergency SOS Alerts"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>{emergencyCount} Emergency SOS</span>
              </button>
            )}

            {/* Global Sound Siren Toggle */}
            {emergencyCount > 0 && onToggleAudioMute && (
              <button
                onClick={onToggleAudioMute}
                className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                  isMuted
                    ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    : isPlayingAudio
                    ? 'bg-rose-100 text-rose-700 border-rose-300 animate-bounce'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={isMuted ? 'Unmute SOS Siren' : 'Mute SOS Siren'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
              </button>
            )}

            {/* Push Notification Button */}
            {notificationPermission !== 'granted' && onRequestNotificationPermission && (
              <button
                onClick={onRequestNotificationPermission}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all"
                title="Enable browser system notifications for critical SOS alerts"
              >
                <BellRing className="w-4 h-4 text-amber-600" />
                <span className="hidden xl:inline">Enable SOS Alerts</span>
              </button>
            )}

            {/* User Profile Badge */}
            <div
              onClick={() => setActiveTab('profile')}
              className="user-menu cursor-pointer p-1.5 pl-2.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end">
                  <span>{doctorProfile.name}</span>
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="text-[10px] font-medium text-slate-500">{doctorProfile.specialty}</div>
              </div>
              <img
                src={doctorProfile.photo}
                alt={doctorProfile.name}
                className="user-avatar"
              />
            </div>
          </div>
        </div>

        {/* Bottom Tier: Navigation Tab Links */}
        <div className="navbar-links py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : item.isEmergency && item.badge > 0
                    ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold border border-rose-200'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isEmergency && item.badge > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isActive
                        ? 'bg-white text-purple-700'
                        : item.isEmergency
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
