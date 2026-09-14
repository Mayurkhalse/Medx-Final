import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Button,
  Avatar,
  Badge,
  Radio,
  Table,
  Space,
  Typography,
  Dropdown,
  message,
} from 'antd';
import {
  OrderedListOutlined,
  AppstoreOutlined,
  UserOutlined,
  EyeOutlined,
  UserAddOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import DoctorAssignmentModal from '../../components/hospital/DoctorAssignmentModal';

const { Title, Text } = Typography;

const CATEGORIES = [
  { key: 'New Patients', label: 'New Patients', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'Reports Pending Review', label: 'Reports Pending Review', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'Critical Alerts', label: 'Critical Alerts', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'Doctor Assignment Pending', label: 'Doctor Assignment Pending', color: '#6D28D9', bg: '#F3EEFF' },
  { key: 'Follow-up Required', label: 'Follow-up Required', color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'Completed', label: 'Completed', color: '#16A34A', bg: '#DCFCE7' },
];

const HospitalCareQueue = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('kanban');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState({});

  // Doctor assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState(null);

  const fetchCareQueue = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getCareQueue();
      if (res.success) {
        setTasks(res.tasks || []);
        setGroupedTasks(res.grouped || {});
      }
    } catch (err) {
      message.error('Failed to load care coordination queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareQueue();
  }, []);

  const handleMoveCategory = async (taskId, newCategory) => {
    try {
      const res = await hospitalApi.updateCareTask(taskId, {
        category: newCategory,
        status: newCategory === 'Completed' ? 'Completed' : 'In Progress',
      });
      if (res.success) {
        message.success(`Task moved to '${newCategory}'.`);
        fetchCareQueue();
      }
    } catch (err) {
      message.error('Failed to update care queue item.');
    }
  };

  const tableColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const cObj = CATEGORIES.find((c) => c.key === cat) || { color: '#6D28D9' };
        return <Tag color={cObj.color} style={{ fontWeight: 600 }}>{cat}</Tag>;
      },
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <div>
          <span
            onClick={() => navigate(`/hospital/patients/${patient?._id}`)}
            style={{ fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
          >
            {patient?.name || 'Patient'}
          </span>
          <div style={{ fontSize: 11, color: '#475569' }}>
            ID: {patient?.patientId || 'PT-ID'} • {patient?.age}y • {patient?.bloodGroup}
          </div>
        </div>
      ),
    },
    {
      title: 'Care Item & Reason',
      key: 'taskInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{record.title}</div>
          <div style={{ fontSize: 12, color: '#475569' }}>{record.reason}</div>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (p) => {
        let bg = '#FEF3C7';
        let col = '#D97706';
        if (p === 'Critical') {
          bg = '#FEE2E2';
          col = '#DC2626';
        } else if (p === 'High') {
          bg = '#FFEDD5';
          col = '#EA580C';
        } else if (p === 'Routine') {
          bg = '#DCFCE7';
          col = '#16A34A';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{p}</Tag>;
      },
    },
    {
      title: 'Assigned Doctor',
      dataIndex: 'assignedDoctorId',
      key: 'assignedDoctor',
      render: (doc) => (
        doc ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar size={22} src={doc.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#6D28D9' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{doc.name}</span>
          </div>
        ) : (
          <Tag color="default">Unassigned</Tag>
        )
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time) => <span style={{ fontSize: 12, color: '#94A3B8' }}>{time || 'Active'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hospital/patients/${record.patientId?._id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => {
              setSelectedPatientForAssign(record.patientId);
              setAssignModalOpen(true);
            }}
            style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 12, fontWeight: 600 }}
          >
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Care Coordination Queue
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Hospital clinical pipeline for tracking admissions, report reviews, doctor allocations, and follow-ups.
          </Text>
        </div>

        <Space>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="kanban">
              <AppstoreOutlined /> Board
            </Radio.Button>
            <Radio.Button value="table">
              <OrderedListOutlined /> Table
            </Radio.Button>
          </Radio.Group>

          <Button icon={<ReloadOutlined />} onClick={fetchCareQueue} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: 16,
          }}
        >
          {CATEGORIES.map((col) => {
            const colTasks = groupedTasks[col.key] || [];
            return (
              <div key={col.key} className="care-queue-column">
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 8,
                    borderBottom: `3px solid ${col.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
                      {col.label}
                    </span>
                  </div>
                  <Badge count={colTasks.length} overflowCount={99} style={{ backgroundColor: col.color, fontWeight: 700 }} />
                </div>

                {/* Cards */}
                {colTasks.map((task) => {
                  const isCrit = task.priority === 'Critical';
                  const isHigh = task.priority === 'High';

                  const moveMenuItems = CATEGORIES.filter((c) => c.key !== col.key).map((c) => ({
                    key: c.key,
                    label: `Move to ${c.label}`,
                    onClick: () => handleMoveCategory(task._id, c.key),
                  }));

                  return (
                    <div key={task._id} className="care-queue-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Tag
                          style={{
                            fontWeight: 700,
                            fontSize: 10,
                            margin: 0,
                            backgroundColor: isCrit ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#F3EEFF',
                            color: isCrit ? '#DC2626' : isHigh ? '#EA580C' : '#6D28D9',
                            border: 'none',
                          }}
                        >
                          {task.priority}
                        </Tag>

                        <Dropdown menu={{ items: moveMenuItems }} trigger={['click']}>
                          <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#94A3B8' }} />
                        </Dropdown>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div
                          onClick={() => navigate(`/hospital/patients/${task.patientId?._id}`)}
                          style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                        >
                          {task.patientId?.name || 'Patient'}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          ID: {task.patientId?.patientId || 'PT-ID'} • {task.patientId?.bloodGroup}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                        {task.reason}
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 8,
                          borderTop: '1px solid #F1F5F9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        {task.assignedDoctorId ? (
                          <span style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700 }}>
                            {task.assignedDoctorId.name}
                          </span>
                        ) : (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setSelectedPatientForAssign(task.patientId);
                              setAssignModalOpen(true);
                            }}
                            style={{ padding: 0, fontSize: 11, fontWeight: 700, color: '#6D28D9' }}
                          >
                            + Assign Doctor
                          </Button>
                        )}
                        <span style={{ fontSize: 10, color: '#94A3B8' }}>{task.time}</span>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 10px',
                      color: '#94A3B8',
                      fontSize: 12,
                      fontStyle: 'italic',
                    }}
                  >
                    No items in this stage
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={tableColumns}
            dataSource={tasks}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Card>
      )}

      {/* Doctor Assignment Workflow Modal */}
      <DoctorAssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        patient={selectedPatientForAssign}
        onSuccess={() => fetchCareQueue()}
      />
    </div>
  );
};

export default HospitalCareQueue;
