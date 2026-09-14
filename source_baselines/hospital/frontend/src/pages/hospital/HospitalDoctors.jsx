import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Avatar,
  Badge,
  Typography,
  Input,
  Select,
  Modal,
  Descriptions,
  message,
  Row,
  Col,
} from 'antd';
import {
  MedicineBoxOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  StarFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import { hospitalApi } from '../../services/hospitalApi';

const { Title, Text } = Typography;
const { Option } = Select;

const HospitalDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Selected doctor modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        availability: availabilityFilter !== 'all' ? availabilityFilter : undefined,
      };
      const res = await hospitalApi.getDoctors(params);
      if (res.success) {
        setDoctors(res.doctors || []);
      }
    } catch (err) {
      message.error('Failed to load doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [availabilityFilter]);

  const filteredDoctors = doctors.filter((doc) => {
    if (!search) return true;
    return (
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#6D28D9' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{record.qualification}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (spec) => <span style={{ fontWeight: 700, color: '#0F172A' }}>{spec}</span>,
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
      title: "Today's Consultations",
      dataIndex: 'todayPatientsCount',
      key: 'patientsToday',
      align: 'center',
      render: (count) => <strong style={{ fontSize: 14, color: '#6D28D9' }}>{count || 0}</strong>,
    },
    {
      title: 'Pending Lab Reviews',
      dataIndex: 'pendingReviewsCount',
      key: 'pendingReviews',
      align: 'center',
      render: (count) => (
        <Badge
          count={count || 0}
          style={{ backgroundColor: count > 3 ? '#DC2626' : '#F59E0B', fontWeight: 700 }}
        />
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availabilityStatus',
      key: 'availability',
      render: (status) => {
        let bg = '#DCFCE7';
        let col = '#16A34A';
        if (status === 'Busy') {
          bg = '#FEF3C7';
          col = '#D97706';
        }
        if (status === 'In Surgery' || status === 'On Leave') {
          bg = '#FEE2E2';
          col = '#DC2626';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{status}</Tag>;
      },
    },
    {
      title: 'Rating / Room',
      key: 'roomRating',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ color: '#F59E0B', fontWeight: 700 }}>
            <StarFilled /> {record.rating || 4.8} / 5.0
          </div>
          <div style={{ color: '#475569' }}>{record.roomNumber || 'OPD-101'}</div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedDoctor(record);
            setDetailModalOpen(true);
          }}
          style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9', borderColor: '#DDD6FE' }}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Medical Staff & Doctor Management
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Attending physicians, active consultation loads, department assignments, and clinical availability.
          </Text>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: '14px 20px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search doctor by name / specialty..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
            >
              <Option value="all">All Statuses</Option>
              <Option value="Available">Available</Option>
              <Option value="Busy">Busy</Option>
              <Option value="In Surgery">In Surgery</Option>
              <Option value="On Leave">On Leave</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button icon={<ReloadOutlined />} onClick={fetchDoctors}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Doctor Directory Table */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredDoctors}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Doctor Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F172A' }}>
            <MedicineBoxOutlined style={{ color: '#6D28D9' }} />
            <span>Doctor Profile & Workload Information</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)} style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9' }}>
            Close
          </Button>,
        ]}
        width={560}
      >
        {selectedDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, backgroundColor: '#F3EEFF', padding: 14, borderRadius: 8, border: '1px solid #DDD6FE' }}>
              <Avatar size={54} src={selectedDoctor.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#6D28D9' }} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: 13, color: '#475569' }}>{selectedDoctor.specialization}</div>
                <Tag color="purple" style={{ marginTop: 4 }}>{selectedDoctor.qualification}</Tag>
              </div>
            </div>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Department">
                {selectedDoctor.departmentId?.name || 'General Medicine'}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Email">
                <MailOutlined /> {selectedDoctor.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {selectedDoctor.phone || '+91 98200 00000'}
              </Descriptions.Item>
              <Descriptions.Item label="Consultation Room">
                {selectedDoctor.roomNumber || 'OPD-101'}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedDoctor.experienceYears || 8} Years of Practice
              </Descriptions.Item>
              <Descriptions.Item label="Current Availability">
                <Tag color={selectedDoctor.availabilityStatus === 'Available' ? 'green' : 'orange'}>
                  {selectedDoctor.availabilityStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Active Workload">
                {selectedDoctor.todayPatientsCount || 0} Patients Today • {selectedDoctor.pendingReviewsCount || 0} Pending Report Reviews
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HospitalDoctors;
