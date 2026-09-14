import React, { useState, useEffect } from 'react';
import {
  ListOrdered, Plus, AlertTriangle, CheckCircle2, User,
  Stethoscope, Clock, RefreshCw, ArrowRight, X
} from 'lucide-react';
import hospitalService from '../../services/hospitalService.js';

const STAGES = [
  'New Patients',
  'Reports Pending Review',
  'Critical Alerts',
  'Doctor Assignment Pending',
  'Follow-up Required',
  'Completed'
];

const STAGE_COLORS = {
  'New Patients': '#3B82F6',
  'Reports Pending Review': '#F59E0B',
  'Critical Alerts': '#EF4444',
  'Doctor Assignment Pending': '#8B5CF6',
  'Follow-up Required': '#06B6D4',
  'Completed': '#10B981'
};

export default function HospitalCareQueue() {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Task creation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    patientId: '',
    category: 'New Patients',
    title: '',
    reason: '',
    priority: 'Medium',
    assignedDoctorId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hospitalService.getCareQueue();
      if (res.success) {
        setGroupedTasks(res.grouped || {});
      }
    } catch (err) {
      console.error('Error loading CareQueue:', err);
      setError('Failed to fetch hospital CareQueue items.');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorsAndPatients = async () => {
    try {
      const docRes = await hospitalService.getDoctors();
      if (docRes.success) setDoctors(docRes.doctors || []);
      const patRes = await hospitalService.getPatients({ limit: 50 });
      if (patRes.success) setPatients(patRes.patients || []);
    } catch (err) {
      console.error('Error loading doctors/patients:', err);
    }
  };

  useEffect(() => {
    loadQueue();
    loadDoctorsAndPatients();
  }, []);

  const handleStageTransition = async (taskId, currentStage) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) return;
    const nextStage = STAGES[currentIndex + 1];

    try {
      const res = await hospitalService.updateCareTask(taskId, {
        category: nextStage,
        actionTaken: `Advanced to ${nextStage} stage by Hospital Administrator.`
      });
      if (res.success) {
        loadQueue();
      }
    } catch (err) {
      console.error('Stage transition error:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.patientId || !newTask.title) return;

    try {
      setSubmitting(true);
      const res = await hospitalService.createCareTask(newTask);
      if (res.success) {
        setIsModalOpen(false);
        setNewTask({
          patientId: '',
          category: 'New Patients',
          title: '',
          reason: '',
          priority: 'Medium',
          assignedDoctorId: ''
        });
        loadQueue();
      }
    } catch (err) {
      console.error('Error creating CareTask:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
            Institutional 6-Stage Operational Care Queue
          </h2>
          <p style={{ color: 'var(--medx-text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Managed inpatient coordination pipeline from admission to discharge
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="medx-btn medx-btn-secondary"
            onClick={loadQueue}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            className="medx-btn medx-btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Create Care Task
          </button>
        </div>
      </div>

      {error && (
        <div className="medx-card" style={{ borderLeft: '4px solid #EF4444', padding: '1rem' }}>
          <p style={{ color: '#EF4444', margin: 0, fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {/* 6-Stage Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        alignItems: 'start'
      }}>
        {STAGES.map((stage) => {
          const tasks = groupedTasks[stage] || [];
          const color = STAGE_COLORS[stage] || '#64748B';

          return (
            <div
              key={stage}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '75vh',
                overflow: 'hidden'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '0.875rem 1rem',
                borderBottom: '1px solid #E2E8F0',
                borderTop: `3px solid ${color}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--medx-navy)' }}>
                  {stage}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: `${color}15`,
                  color: color,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px'
                }}>
                  {tasks.length}
                </span>
              </div>

              {/* Task list container */}
              <div style={{
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                overflowY: 'auto',
                flex: 1
              }}>
                {tasks.length === 0 ? (
                  <div style={{
                    padding: '1.5rem 0.5rem',
                    textAlign: 'center',
                    color: '#94A3B8',
                    fontSize: '0.8125rem'
                  }}>
                    No tasks in this stage
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task._id}
                      className="medx-card"
                      style={{
                        padding: '1rem',
                        borderLeft: `4px solid ${task.priority === 'Critical' ? '#EF4444' : task.priority === 'High' ? '#F59E0B' : '#3B82F6'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--medx-navy)', margin: 0 }}>
                          {task.title}
                        </h4>
                        <span className={`medx-badge ${task.priority === 'Critical' ? 'medx-badge-danger' : task.priority === 'High' ? 'medx-badge-warning' : 'medx-badge-primary'}`} style={{ fontSize: '0.6875rem' }}>
                          {task.priority}
                        </span>
                      </div>

                      {task.reason && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--medx-text-secondary)', margin: 0 }}>
                          {task.reason}
                        </p>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#64748B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <User size={13} />
                          <strong>Patient:</strong> {task.patientId?.userId?.name || 'Inpatient'}
                        </div>
                        {task.assignedDoctorId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Stethoscope size={13} />
                            <strong>Doctor:</strong> Dr. {task.assignedDoctorId.userId?.name || task.assignedDoctorId.specialization || 'Attending'}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Clock size={13} />
                          <span>{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Action footer */}
                      {stage !== 'Completed' && (
                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            className="medx-btn medx-btn-secondary"
                            onClick={() => handleStageTransition(task._id, stage)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            Advance Stage <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="medx-card" style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--medx-navy)', margin: 0 }}>
                Create Inpatient Care Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Inpatient *
                </label>
                <select
                  required
                  value={newTask.patientId}
                  onChange={(e) => setNewTask({ ...newTask, patientId: e.target.value })}
                  className="medx-input"
                >
                  <option value="">Select Inpatient...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.userId?.name || p.legacyId} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Pipeline Stage *
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="medx-input"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Post-Op Hemodynamic Evaluation"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="medx-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="medx-input"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Assigned Physician (Optional)
                </label>
                <select
                  value={newTask.assignedDoctorId}
                  onChange={(e) => setNewTask({ ...newTask, assignedDoctorId: e.target.value })}
                  className="medx-input"
                >
                  <option value="">Unassigned</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.userId?.name || 'Physician'} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--medx-navy)' }}>
                  Reason / Clinical Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Operational context or clinical directives..."
                  value={newTask.reason}
                  onChange={(e) => setNewTask({ ...newTask, reason: e.target.value })}
                  className="medx-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="medx-btn medx-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="medx-btn medx-btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
