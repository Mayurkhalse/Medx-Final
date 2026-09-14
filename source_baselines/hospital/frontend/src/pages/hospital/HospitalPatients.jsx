import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Avatar,
  Row,
  Col,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  UserAddOutlined,
  EyeOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import DoctorAssignmentModal from '../../components/hospital/DoctorAssignmentModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const HospitalPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [patientIdFilter, setPatientIdFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all');

  // Metadata dropdowns
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Assignment Modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState(null);

  const fetchFiltersData = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        hospitalApi.getDepartments(),
        hospitalApi.getDoctors(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (docRes.success) setDoctors(docRes.doctors || []);
    } catch (err) {
      console.warn('Failed to load filter metadata:', err);
    }
  };

  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: search || undefined,
        patientId: patientIdFilter || undefined,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
        alertStatus: alertFilter !== 'all' ? alertFilter : undefined,
        reportStatus: reportFilter !== 'all' ? reportFilter : undefined,
      };

      const res = await hospitalApi.getPatients(params);
      if (res.success) {
        setPatients(res.patients);
        setPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          total: res.pagination.total,
        });
      }
    } catch (err) {
      message.error('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchPatients(1);
  }, [departmentFilter, doctorFilter, alertFilter, reportFilter]);

  const handleSearchSubmit = () => {
    fetchPatients(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setPatientIdFilter('');
    setDepartmentFilter('all');
    setDoctorFilter('all');
    setAlertFilter('all');
    setReportFilter('all');
    setTimeout(() => fetchPatients(1), 0);
  };

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 110,
      render: (id, record) => (
        <span
          onClick={() => navigate(`/hospital/patients/${record._id}`)}
          style={{ fontWeight: 700, color: '#6D28D9', cursor: 'pointer' }}
        >
          {id}
        </span>
      ),
    },
    {
      title: 'Patient Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div
          onClick={() => navigate(`/hospital/patients/${record._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{name}</div>
          <div style={{ fontSize: 11, color: '#475569' }}>{record.contact}</div>
        </div>
      ),
    },
    {
      title: 'Age / Sex',
      key: 'ageGender',
      width: 100,
      render: (_, record) => (
        <span style={{ fontSize: 13, color: '#475569' }}>
          {record.age}y • {record.gender === 'Male' ? 'M' : record.gender === 'Female' ? 'F' : 'O'}
        </span>
      ),
    },
    {
      title: 'Blood Grp',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
      width: 90,
      align: 'center',
      render: (bg) => (
        <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 700 }}>
          {bg || 'O+'}
        </Tag>
      ),
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
          <Tag color="default" style={{ fontStyle: 'italic' }}>Unassigned</Tag>
        )
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      key: 'department',
      render: (dept) => (
        <Tag style={{ backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', fontSize: 12 }}>
          {dept?.name || 'General Medicine'}
        </Tag>
      ),
    },
    {
      title: 'Latest Report',
      dataIndex: 'latestReportSummary',
      key: 'latestReport',
      ellipsis: true,
      render: (summary) => (
        <Tooltip title={summary}>
          <span style={{ fontSize: 12, color: '#475569' }}>
            {summary || 'No recent reports'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Alert Status',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      render: (status) => {
        let bg = '#F1F5F9';
        let col = '#475569';
        if (status === 'Critical') {
          bg = '#FEE2E2';
          col = '#DC2626';
        } else if (status === 'High' || status === 'Requires Review') {
          bg = '#FEF3C7';
          col = '#D97706';
        } else if (status === 'Normal') {
          bg = '#DCFCE7';
          col = '#16A34A';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{status || 'None'}</Tag>;
      },
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      width: 110,
      render: (date) => (
        <span style={{ fontSize: 12, color: '#475569' }}>
          {dayjs(date).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size={6} wrap>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hospital/patients/${record._id}`)}
            style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 12, fontWeight: 600 }}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => {
              setSelectedPatientForAssign(record);
              setAssignmentModalOpen(true);
            }}
            style={{ fontSize: 12, borderColor: '#DDD6FE', color: '#6D28D9' }}
          >
            Assign
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => navigate(`/hospital/patients/${record._id}?tab=timeline`)}
            title="Care Timeline"
            style={{ fontSize: 12 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Patient Care Management
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Comprehensive directory of admitted and outpatient individuals with real-time laboratory & alert triage.
          </Text>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by patient name / contact..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearchSubmit}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Filter by ID (e.g. PT-1001)"
              value={patientIdFilter}
              onChange={(e) => setPatientIdFilter(e.target.value)}
              onPressEnter={handleSearchSubmit}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="Department"
            >
              <Option value="all">All Departments</Option>
              {departments.map((d) => (
                <Option key={d._id} value={d._id}>{d.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={doctorFilter}
              onChange={setDoctorFilter}
              placeholder="Assigned Doctor"
            >
              <Option value="all">All Doctors</Option>
              {doctors.map((doc) => (
                <Option key={doc._id} value={doc._id}>{doc.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Select
              style={{ width: '100%' }}
              value={alertFilter}
              onChange={setAlertFilter}
              placeholder="Alert Status"
            >
              <Option value="all">All Alerts</Option>
              <Option value="Critical">Critical</Option>
              <Option value="Requires Review">Requires Review</Option>
              <Option value="High">High</Option>
              <Option value="Normal">Normal</Option>
              <Option value="None">None</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Space>
              <Button type="primary" onClick={handleSearchSubmit} style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}>
                Filter
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilters} title="Reset Filters" />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Patients Table */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showTotal: (total) => `Total ${total} patients registered`,
            onChange: (p) => fetchPatients(p),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Doctor Assignment Workflow Modal */}
      <DoctorAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        patient={selectedPatientForAssign}
        onSuccess={() => fetchPatients(pagination.page)}
      />
    </div>
  );
};

export default HospitalPatients;
