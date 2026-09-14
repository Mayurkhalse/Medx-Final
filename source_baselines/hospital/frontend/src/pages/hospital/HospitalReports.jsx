import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const HospitalReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [extractionFilter, setExtractionFilter] = useState('all');

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: search || undefined,
        reportType: reportTypeFilter !== 'all' ? reportTypeFilter : undefined,
        reviewStatus: reviewStatusFilter !== 'all' ? reviewStatusFilter : undefined,
        extractionStatus: extractionFilter !== 'all' ? extractionFilter : undefined,
      };

      const res = await hospitalApi.getReports(params);
      if (res.success) {
        setReports(res.reports);
        setPagination({
          page: res.pagination.page,
          limit: res.pagination.limit,
          total: res.pagination.total,
        });
      }
    } catch (err) {
      message.error('Failed to load lab reports directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [reportTypeFilter, reviewStatusFilter, extractionFilter]);

  const handleSearchSubmit = () => {
    fetchReports(1);
  };

  const columns = [
    {
      title: 'Report ID',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 130,
      render: (id, record) => (
        <span
          onClick={() => navigate(`/hospital/reports/${record._id}`)}
          style={{ fontWeight: 700, color: '#6D28D9', cursor: 'pointer' }}
        >
          {id}
        </span>
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
            style={{ fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
          >
            {patient?.name || 'Unknown Patient'}
          </span>
          <div style={{ fontSize: 11, color: '#475569' }}>
            ID: {patient?.patientId || 'PT-ID'} • {patient?.age}y • {patient?.bloodGroup}
          </div>
        </div>
      ),
    },
    {
      title: 'Report Name & Type',
      key: 'reportInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0F172A' }}>{record.reportName}</div>
          <Tag style={{ marginTop: 2, fontSize: 11, backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
            {record.reportType}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Test Lab',
      dataIndex: 'labName',
      key: 'labName',
      render: (lab, record) => (
        <div>
          <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{lab || record.labId?.name || 'Med-X Diagnostics'}</div>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>NABL Accredited</div>
        </div>
      ),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date) => (
        <span style={{ fontSize: 12, color: '#475569' }}>
          {dayjs(date).format('DD MMM YYYY, hh:mm A')}
        </span>
      ),
    },
    {
      title: 'Extraction Status',
      dataIndex: 'extractionStatus',
      key: 'extractionStatus',
      render: (status) => (
        <Tag style={{ backgroundColor: '#DCFCE7', color: '#16A34A', border: 'none', fontWeight: 600 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'AI Analysis',
      dataIndex: 'analysisStatus',
      key: 'analysisStatus',
      render: (status) => (
        <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 600 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Review Status',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      render: (status) => {
        let bg = '#F3EEFF';
        let col = '#6D28D9';
        if (status === 'Reviewed') {
          bg = '#DCFCE7';
          col = '#16A34A';
        } else if (status === 'Requires Review') {
          bg = '#FEF3C7';
          col = '#D97706';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/hospital/reports/${record._id}`)}
          style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontSize: 12, fontWeight: 600 }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0F172A', fontWeight: 800 }}>
            Laboratory Report Management
          </Title>
          <Text style={{ fontSize: 14, color: '#475569' }}>
            Central repository of diagnostic panels uploaded by partnered laboratories with automated parameter extraction & AI clinical decision support.
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Report ID, Report Name..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearchSubmit}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={reportTypeFilter}
              onChange={setReportTypeFilter}
              placeholder="Report Type"
            >
              <Option value="all">All Report Types</Option>
              <Option value="Complete Blood Count (CBC)">CBC (Blood Count)</Option>
              <Option value="Lipid Profile">Lipid Profile</Option>
              <Option value="Blood Glucose / HbA1c">Blood Glucose / HbA1c</Option>
              <Option value="Thyroid Panel (TSH, T3, T4)">Thyroid Panel</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={reviewStatusFilter}
              onChange={setReviewStatusFilter}
              placeholder="Review Status"
            >
              <Option value="all">All Review Statuses</Option>
              <Option value="Pending Review">Pending Review</Option>
              <Option value="Requires Review">Requires Review</Option>
              <Option value="Reviewed">Reviewed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" onClick={handleSearchSubmit} style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 600 }}>
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch('');
                  setReportTypeFilter('all');
                  setReviewStatusFilter('all');
                  setExtractionFilter('all');
                  setTimeout(() => fetchReports(1), 0);
                }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Reports Table */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showTotal: (total) => `Total ${total} laboratory reports on record`,
            onChange: (p) => fetchReports(p),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default HospitalReports;
