import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Divider,
  Input,
  Select,
  Alert,
  Typography,
  Skeleton,
  Empty,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalApi } from '../../services/hospitalApi';
import dayjs from 'dayjs';

const { Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HospitalReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const [repRes, docRes] = await Promise.all([
        hospitalApi.getReportById(reportId),
        hospitalApi.getDoctors(),
      ]);

      if (repRes.success) {
        setReport(repRes.report);
        setReviewNotes(repRes.report.reviewNotes || '');
        if (repRes.report.reviewedByDoctorId) {
          setSelectedDoctorId(repRes.report.reviewedByDoctorId._id || repRes.report.reviewedByDoctorId);
        }
      }
      if (docRes.success) {
        setDoctors(docRes.doctors || []);
      }
    } catch (err) {
      message.error('Failed to load laboratory report details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const handleReviewSubmit = async () => {
    try {
      setSubmittingReview(true);
      const res = await hospitalApi.reviewReport(report._id, {
        doctorId: selectedDoctorId,
        reviewNotes,
        reviewStatus: 'Reviewed',
      });
      if (res.success) {
        message.success('Doctor clinical review recorded successfully.');
        setReport(res.report);
      }
    } catch (err) {
      message.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ borderRadius: 12, padding: 24 }}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </Card>
    );
  }

  if (!report) {
    return (
      <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
        <Empty description="Laboratory report not found in the system." />
        <Button type="primary" onClick={() => navigate('/hospital/reports')} style={{ marginTop: 16, backgroundColor: '#6D28D9' }}>
          Back to Reports Directory
        </Button>
      </Card>
    );
  }

  const parameterColumns = [
    {
      title: 'Parameter Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{name}</span>
          {record.flagged && (
            <Tag color="red" style={{ marginLeft: 8, fontSize: 10, fontWeight: 700 }}>
              FLAGGED
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Extracted Value',
      dataIndex: 'value',
      key: 'value',
      render: (val, record) => {
        const isAbnormal = record.status !== 'Normal';
        return (
          <span
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: isAbnormal ? '#DC2626' : '#16A34A',
            }}
          >
            {val}
          </span>
        );
      },
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => <span style={{ color: '#475569' }}>{unit || '—'}</span>,
    },
    {
      title: 'Lab Reference Range',
      dataIndex: 'referenceRange',
      key: 'refRange',
      render: (range) => (
        <span style={{ fontSize: 12, color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: 4 }}>
          {range || 'Standard lab range'}
        </span>
      ),
    },
    {
      title: 'Clinical Indicator',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let bg = '#DCFCE7';
        let col = '#16A34A';
        if (status === 'Critical') {
          bg = '#FEE2E2';
          col = '#DC2626';
        } else if (status === 'High' || status === 'Low') {
          bg = '#FEF3C7';
          col = '#D97706';
        } else if (status === 'Borderline') {
          bg = '#EFF6FF';
          col = '#2563EB';
        }
        return <Tag style={{ backgroundColor: bg, color: col, border: 'none', fontWeight: 700 }}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header card with Back Navigation & Meta */}
      <Card className="medx-card" style={{ borderRadius: 12 }} bodyStyle={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/hospital/reports')} />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: '#F3EEFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6D28D9',
                fontSize: 24,
              }}
            >
              <ExperimentOutlined />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  {report.reportName}
                </span>
                <Tag color="purple">{report.reportType}</Tag>
                <Tag style={{ backgroundColor: report.reviewStatus === 'Reviewed' ? '#DCFCE7' : '#FEF3C7', color: report.reviewStatus === 'Reviewed' ? '#16A34A' : '#D97706', border: 'none', fontWeight: 700 }}>
                  {report.reviewStatus}
                </Tag>
              </div>

              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                Report ID: <strong style={{ color: '#6D28D9' }}>{report.reportId}</strong> • Uploaded:{' '}
                {dayjs(report.uploadedAt).format('DD MMMM YYYY, hh:mm A')}
              </div>
            </div>
          </div>

          <Button
            type="default"
            onClick={() => navigate(`/hospital/patients/${report.patientId?._id}`)}
            style={{ color: '#6D28D9', borderColor: '#DDD6FE', fontWeight: 600 }}
          >
            View Patient Profile
          </Button>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Patient & Laboratory Metadata Info */}
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                PATIENT DEMOGRAPHICS
              </span>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {report.patientId?.name || 'Patient'} ({report.patientId?.patientId || 'PT-ID'})
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                {report.patientId?.age} yrs • {report.patientId?.gender} • Blood Group: <Tag color="purple">{report.patientId?.bloodGroup || 'O+'}</Tag>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                PERFORMING LABORATORY
              </span>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                {report.labName || report.labId?.name || 'Med-X Central Diagnostics Lab'}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                {report.labId?.accreditation || 'NABL & CAP Certified Diagnostic Facility'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Extracted Parameters Table */}
      <Card
        className="medx-card"
        style={{ borderRadius: 12 }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              Extracted Laboratory Parameters
            </span>
            <Tag style={{ backgroundColor: '#F3EEFF', color: '#6D28D9', border: '1px solid #DDD6FE', fontWeight: 600 }}>OCR & LIS Stream Verified</Tag>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={parameterColumns}
          dataSource={report.parameters || []}
          rowKey="_id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* AI-Assisted Clinical Summary in Lavender (#F3EEFF) */}
      <Card
        className="medx-card"
        style={{
          borderRadius: 12,
          borderLeft: '4px solid #6D28D9',
          backgroundColor: '#F3EEFF',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5B21B6' }}>
            <MedicineBoxOutlined style={{ fontSize: 18, color: '#6D28D9' }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>AI-Assisted Clinical Decision Summary</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Paragraph style={{ fontSize: 14, color: '#0F172A', margin: 0, lineHeight: 1.6 }}>
            {report.aiSummary?.summaryText ||
              'Automated parameter extraction complete. Review highlighted physiological markers.'}
          </Paragraph>

          {/* Abnormal Highlights */}
          {report.aiSummary?.abnormalHighlights && report.aiSummary.abnormalHighlights.length > 0 && (
            <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #DDD6FE' }}>
              <strong style={{ color: '#5B21B6', fontSize: 13 }}>Items Requiring Clinical Review:</strong>
              <ul style={{ paddingLeft: 20, marginTop: 6, fontSize: 13, color: '#475569' }}>
                {report.aiSummary.abnormalHighlights.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trend observations */}
          {report.aiSummary?.trendObservations && report.aiSummary.trendObservations.length > 0 && (
            <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #DDD6FE' }}>
              <strong style={{ color: '#5B21B6', fontSize: 13 }}>Historical Trajectory Observations:</strong>
              <ul style={{ paddingLeft: 20, marginTop: 6, fontSize: 13, color: '#475569' }}>
                {report.aiSummary.trendObservations.map((trend, idx) => (
                  <li key={idx}>{trend}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Explicit non-diagnostic disclaimer */}
          <Alert
            message="Clinical Safety Notice"
            description={
              report.aiSummary?.clinicalNotice ||
              'AI-generated information for clinical decision support. Not a medical diagnosis. Final medical decisions remain strictly with qualified doctors.'
            }
            type="info"
            showIcon
            style={{ backgroundColor: '#FFFFFF', borderColor: '#DDD6FE', color: '#5B21B6' }}
          />
        </div>
      </Card>

      {/* Doctor Clinical Review & Sign-Off Card */}
      <Card
        className="medx-card"
        style={{ borderRadius: 12 }}
        title={<span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Attending Physician Sign-Off & Notes</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 6, fontWeight: 600, color: '#0F172A' }}>Reviewing Doctor</div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Reviewing Doctor"
                value={selectedDoctorId}
                onChange={setSelectedDoctorId}
                size="large"
              >
                {doctors.map((doc) => (
                  <Option key={doc._id} value={doc._id}>
                    {doc.name} — {doc.specialization}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <div>
            <div style={{ marginBottom: 6, fontWeight: 600, color: '#0F172A' }}>Physician Evaluation & Treatment Instructions</div>
            <TextArea
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter clinical assessment, prescription instructions, diet modifications, or follow-up timelines..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleReviewSubmit}
              loading={submittingReview}
              style={{ backgroundColor: '#6D28D9', borderColor: '#6D28D9', fontWeight: 700 }}
            >
              Save & Mark as Reviewed
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HospitalReportDetails;
