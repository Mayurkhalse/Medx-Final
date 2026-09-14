import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Select,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Row,
  Col,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const HospitalAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ today: 0, upcoming: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Filters
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Edit / Reschedule Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  const fetchFilters = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        hospitalApi.getDoctors(),
        hospitalApi.getDepartments(),
      ]);
      if (docRes.success) setDoctors(docRes.doctors || []);
      if (deptRes.success) setDepartments(deptRes.departments || []);
    } catch (err) {
      console.warn('Failed to load filters:', err);
    }
  };

  const fetchAppointments = async (tab = activeTab) => {
    try {
      setLoading(true);
      const params = {
        doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
      };

      if (tab === 'today') params.status = 'Today';
      else if (tab === 'upcoming') params.status = 'Upcoming';
      else if (tab === 'completed') params.status = 'Completed';
      else if (tab === 'cancelled') params.status = 'Cancelled';

      const res = await hospitalApi.getAppointments(params);
      if (res.success) {
        setAppointments(res.appointments);
        if (res.statusCounts) setStatusCounts(res.statusCounts);
      }
    } catch (err) {
      message.error('Failed to load hospital appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAppointments(activeTab);
  }, [activeTab, doctorFilter, departmentFilter]);

  const handleOpenEdit = (record) => {
    setSelectedAppointment(record);
    form.setFieldsValue({
      doctorId: record.doctorId?._id || record.doctorId,
      status: record.status,
      timeSlot: record.timeSlot,
      hospitalNotes: record.hospitalNotes,
    });
    setEditModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUpdating(true);
      const res = await hospitalApi.updateAppointment(selectedAppointment._id, values);
      if (res.success) {
        message.success('Appointment schedule updated.');
        setEditModalOpen(false);
        fetchAppointments(activeTab);
      }
    } catch (err) {
      message.error('Failed to update appointment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const res = await hospitalApi.updateAppointment(id, { status: 'Cancelled' });
      if (res.success) {
        message.info('Appointment cancelled.');
        fetchAppointments(activeTab);
      }
    } catch (err) {
      message.error('Failed to cancel appointment.');
    }
  };

  const columns = [
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>
            {dayjs(record.date).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined style={{ fontSize: 10, color: '#6D28D9' }} /> {record.timeSlot}
          </div>
        </div>
      ),
    },
    {
      title: 'Patient',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <div>
          <span
            onClick={() => navigate(`/hospital/patients/${patient?._id}`)}
            style={{ fontWeight: 700, color: '#6D28D9', cursor: 'pointer' }}
          >
            {patient?.name || 'Patient'}
          </span>
          <div style={{ fontSize: 11, color: '#475569' }}>
            ID: {patient?.patientId || 'PT-ID'} • {patient?.contact}
          </div>
        </div>
      ),
    },
    {
      title: 'Attending Doctor',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{doctor?.name || 'Unassigned'}</div>
          <div style={{ fontSize: 11, color: '#475569' }}>{doctor?.roomNumber || 'OPD-101'}</div>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      key: 'department',
      render: (dept) => (
        <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 600 }}>
          {dept?.name || 'General Medicine'}
        </Tag>
      ),
    },
    {
      title: 'Consultation Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let bg = '#EFF6FF';
        let col = '#2563EB';
        if (type === 'Teleconsultation') {
          bg = '#F3EEFF';
          col = '#6D28D9';
        }
        if (type === 'Emergency Consult') {
          bg = '#FEE2E2';
          col = '#DC2626';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 600 }}>{type}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let bg = '#EFF6FF';
        let col = '#2563EB';
        if (status === 'Today') {
          bg = '#FEE2E2';
          col = '#DC2626';
        } else if (status === 'Completed') {
          bg = '#DCFCE7';
          col = '#16A34A';
        } else if (status === 'Cancelled') {
          bg = '#F1F5F9';
          col = '#475569';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            style={{ fontSize: 12, color: '#6D28D9', borderColor: '#DDD6FE' }}
          >
            Manage
          </Button>
          {record.status !== 'Cancelled' && record.status !== 'Completed' && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelAppointment(record._id)}
              style={{ fontSize: 12 }}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: 'All Appointments' },
    { key: 'today', label: `Today (${statusCounts.today || 0})` },
    { key: 'upcoming', label: `Upcoming (${statusCounts.upcoming || 0})` },
    { key: 'completed', label: `Completed (${statusCounts.completed || 0})` },
    { key: 'cancelled', label: `Cancelled (${statusCounts.cancelled || 0})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Hospital Appointments Schedule
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Real-time outpatient consultation overview, teleconsultations, and specialist doctor slot management.
          </Text>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: '14px 20px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={doctorFilter}
              onChange={setDoctorFilter}
              placeholder="Doctor"
            >
              <Option value="all">All Doctors</Option>
              {doctors.map((d) => (
                <Option key={d._id} value={d._id}>{d.name} ({d.specialization})</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="Department"
            >
              <Option value="all">All Departments</Option>
              {departments.map((dept) => (
                <Option key={dept._id} value={dept._id}>{dept.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setDoctorFilter('all');
                setDepartmentFilter('all');
                setTimeout(() => fetchAppointments(activeTab), 0);
              }}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Appointments List */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0 20px' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Edit / Reschedule Modal */}
      <Modal
        title={<span style={{ color: '#0F172A', fontWeight: 700 }}>Reschedule / Manage Appointment</span>}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleUpdateSubmit}
        confirmLoading={updating}
        okText="Update Schedule"
        okButtonProps={{ style: { backgroundColor: '#6D28D9', borderColor: '#6D28D9' } }}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="doctorId" label="Assigned Doctor" rules={[{ required: true }]}>
            <Select placeholder="Select Doctor">
              {doctors.map((d) => (
                <Option key={d._id} value={d._id}>{d.name} ({d.specialization})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="timeSlot" label="Time Slot" rules={[{ required: true }]}>
            <Select>
              <Option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</Option>
              <Option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</Option>
              <Option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</Option>
              <Option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</Option>
              <Option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Today">Today</Option>
              <Option value="Upcoming">Upcoming</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item name="hospitalNotes" label="Hospital Administrative Notes">
            <Input.TextArea rows={2} placeholder="Add scheduling or clinical notes..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HospitalAppointments;
