import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Search,
  CheckCircle2,
  Paperclip,
  Clock,
  Phone
} from 'lucide-react';

export default function MessagesView({
  messages,
  patients,
  onSendMessage,
  onViewPatient
}) {
  const [selectedConvId, setSelectedConvId] = useState(messages[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [searchConv, setSearchConv] = useState('');

  const activeConv = messages.find(m => m.id === selectedConvId) || messages[0];
  const matchedPatient = patients.find(p => p.id === activeConv?.patientId);

  const filteredMessages = messages.filter(m =>
    m.patientName.toLowerCase().includes(searchConv.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    onSendMessage(activeConv.id, inputText);
    setInputText('');
  };

  const cannedTemplates = [
    "Please continue your medications as prescribed.",
    "Your lab test results look good.",
    "Please visit the clinic for an in-person BP check tomorrow.",
    "Ensure 8 hours of fasting before your blood test."
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <span>Doctor Patient Messaging Desk</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Secure HIPAA-compliant clinical tele-consultation chat messaging
          </p>
        </div>
      </div>

      {/* Main 2-Column Chat Container */}
      <div className="card bg-white rounded-3xl border border-purple-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px] shadow-sm">
        
        {/* Left Column: Conversation List */}
        <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-purple-50/20">
          
          {/* Search Box */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient chat..."
                value={searchConv}
                onChange={(e) => setSearchConv(e.target.value)}
                className="form-control pl-10"
              />
            </div>
          </div>

          {/* Conversation List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredMessages.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-4 border-l-purple-600 shadow-xs' : 'hover:bg-purple-50/40'
                  }`}
                >
                  <img
                    src={conv.photo}
                    alt={conv.patientName}
                    className="w-11 h-11 rounded-xl object-cover border border-purple-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{conv.patientName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{conv.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="badge badge-primary font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Chat Conversation Pane */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col justify-between bg-white">
            
            {/* Active Patient Chat Header */}
            <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/30">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.photo}
                  alt={activeConv.patientName}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeConv.patientName}</h3>
                  <span className="text-[11px] text-slate-500">Patient ID: {activeConv.patientId}</span>
                </div>
              </div>

              {matchedPatient && (
                <button
                  onClick={() => onViewPatient(matchedPatient)}
                  className="btn btn-primary btn-sm"
                >
                  View Profile
                </button>
              )}
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/20">
              {activeConv.conversation?.map((msg, idx) => {
                const isDoctor = msg.sender === 'doctor';
                
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isDoctor
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-br-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Canned Advice Templates Strip */}
            <div className="p-2 px-4 bg-purple-50/30 border-t border-purple-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Quick Responses:</span>
              {cannedTemplates.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(tmpl)}
                  className="btn btn-outline btn-sm font-medium"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-3 bg-white">
              <input
                type="text"
                placeholder="Type your medical response or clinical advice..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="form-control flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
            Select a patient conversation on the left to start messaging.
          </div>
        )}

      </div>

    </div>
  );
}
