import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Badge,
  Input,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  AlertOutlined,
  EyeOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import DoctorAssignmentModal from '../../components/hospital/DoctorAssignmentModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const HospitalAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ all: 0, critical: 0, high: 0, medium: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Doctor assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState(null);
  const [selectedAlertForAssign, setSelectedAlertForAssign] = useState(null);

  const fetchAlerts = async (tab = activeTab) => {
    try {
      setLoading(true);
      const params = {};
      if (tab === 'critical') params.severity = 'Critical';
      else if (tab === 'high') params.severity = 'High';
      else if (tab === 'medium') params.severity = 'Medium';
      else if (tab === 'resolved') params.status = 'Resolved';

      const res = await hospitalApi.getAlerts(params);
      if (res.success) {
        setAlerts(res.alerts);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      message.error('Failed to load critical alerts feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts(activeTab);
  }, [activeTab]);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await hospitalApi.updateAlert(alertId, {
        status: 'Resolved',
        hospitalNote: 'Clinical review completed and resolved by Hospital Admin.',
      });
      if (res.success) {
        message.success('Health alert marked as resolved.');
        fetchAlerts(activeTab);
      }
    } catch (err) {
      message.error('Failed to resolve alert.');
    }
  };

  const handleOpenAssign = (record) => {
    setSelectedPatientForAssign(record.patientId);
    setSelectedAlertForAssign(record);
    setAssignModalOpen(true);
  };

  const filteredAlerts = alerts.filter((al) => {
    if (!search) return true;
    const patName = al.patientId?.name || '';
    const param = al.parameter || '';
    return patName.toLowerCase().includes(search.toLowerCase()) || param.toLowerCase().includes(search.toLowerCase());
  });

  const columns = [
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
      title: 'Parameter & Value',
      key: 'paramValue',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
            {record.parameter}
          </div>
          <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 700 }}>
            {record.value}
          </div>
        </div>
      ),
    },
    {
      title: 'Lab Reference Range',
      dataIndex: 'referenceRange',
      key: 'refRange',
      render: (range) => (
        <Tooltip title="Reference range configured by the testing laboratory">
          <span style={{ fontSize: 12, color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: 4 }}>
            {range || 'Configured lab range'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (sev) => {
        let bg = '#FEF3C7';
        let col = '#D97706';
        if (sev === 'Critical') {
          bg = '#FEE2E2';
          col = '#DC2626';
        } else if (sev === 'High') {
          bg = '#FFEDD5';
          col = '#EA580C';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{sev}</Tag>;
      },
    },
    {
      title: 'Report / Date',
      key: 'reportDate',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
            {record.reportName || 'Laboratory Report'}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>
            {dayjs(record.generatedAt || record.createdAt).format('hh:mm A, DD MMM')}
          </div>
        </div>
      ),
    },
    {
      title: 'Clinical Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Requires Review') color = 'volcano';
        else if (status === 'Active') color = 'red';
        else if (status === 'Assigned') color = 'purple';
        else if (status === 'Resolved') color = 'green';
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
      },
    },
    {
      title: 'Assigned Doctor',
      dataIndex: 'assignedDoctorId',
      key: 'assignedDoctor',
      render: (doc) => (
        doc ? (
          <div>
            <div style={{ fontWeight: 700, color: '#6D28D9', fontSize: 13 }}>{doc.name}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{doc.specialization}</div>
          </div>
        ) : (
          <Tag color="orange">Pending Assignment</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6} wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              record.reportId
                ? navigate(`/hospital/reports/${record.reportId?._id || record.reportId}`)
                : navigate(`/hospital/patients/${record.patientId?._id}`)
            }
            style={{ fontSize: 12, color: '#0F172A' }}
          >
            View
          </Button>

          {record.status !== 'Resolved' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<UserAddOutlined />}
                onClick={() => handleOpenAssign(record)}
                style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 12, fontWeight: 600 }}
              >
                Assign
              </Button>
              <Popconfirm
                title="Resolve Alert"
                description="Mark this critical parameter alert as reviewed & resolved?"
                onConfirm={() => handleResolveAlert(record._id)}
                okText="Resolve"
                cancelText="Cancel"
              >
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#16A34A', borderColor: '#BBF7D0', fontSize: 12 }}
                >
                  Resolve
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          All Alerts <Badge count={counts.all} overflowCount={99} style={{ backgroundColor: '#6D28D9', marginLeft: 4 }} />
        </span>
      ),
    },
    {
      key: 'critical',
      label: (
        <span>
          Critical <Badge count={counts.critical} style={{ backgroundColor: '#DC2626', marginLeft: 4 }} />
        </span>
      ),
    },
    {
      key: 'high',
      label: (
        <span>
          High <Badge count={counts.high} style={{ backgroundColor: '#F59E0B', marginLeft: 4 }} />
        </span>
      ),
    },
    {
      key: 'medium',
      label: (
        <span>
          Medium <Badge count={counts.medium} style={{ backgroundColor: '#2563EB', marginLeft: 4 }} />
        </span>
      ),
    },
    {
      key: 'resolved',
      label: (
        <span>
          Resolved <Badge count={counts.resolved} style={{ backgroundColor: '#16A34A', marginLeft: 4 }} />
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Critical Health Alerts Triage
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Real-time patient parameter surveillance for abnormal and critical laboratory indicators requiring prompt physician attention.
          </Text>
        </div>

        <Space>
          <Input
            placeholder="Search alert by patient / parameter..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchAlerts(activeTab)} />
        </Space>
      </div>

      {/* Medical safety notice in Lavender */}
      <div className="medical-disclaimer-banner">
        <ExclamationCircleOutlined style={{ fontSize: 18, color: '#6D28D9' }} />
        <div>
          <strong style={{ color: '#5B21B6' }}>Clinical Decision Support Protocol:</strong> Health alerts identify physiological values outside reference ranges to assist clinical workflow. System does not produce diagnoses. All findings require medical review by qualified physicians.
        </div>
      </div>

      {/* Tabs and Table */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0 20px' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>

        <Table
          columns={columns}
          dataSource={filteredAlerts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Assignment Modal */}
      <DoctorAssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        patient={selectedPatientForAssign}
        alert={selectedAlertForAssign}
        onSuccess={() => fetchAlerts(activeTab)}
      />
    </div>
  );
};

export default HospitalAlerts;
