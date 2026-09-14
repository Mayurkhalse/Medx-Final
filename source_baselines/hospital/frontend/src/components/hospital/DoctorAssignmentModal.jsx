import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Radio,
  Tag,
  Avatar,
  message,
  Spin,
} from 'antd';
import {
  MedicineBoxOutlined,
  UserOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { hospitalApi } from '../../services/hospitalApi';

const { TextArea } = Input;
const { Option } = Select;

const DoctorAssignmentModal = ({
  open,
  onClose,
  patient,
  alert,
  report,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDeptsAndDoctors();
      form.resetFields();
      if (patient) {
        form.setFieldsValue({
          departmentId: patient.departmentId?._id || patient.departmentId || undefined,
          priority: alert?.severity === 'Critical' ? 'Urgent' : 'High',
          hospitalNote: alert ? `Triage review for ${alert.parameter} (${alert.value}).` : '',
        });
        if (patient.departmentId?._id || patient.departmentId) {
          setSelectedDeptId(patient.departmentId?._id || patient.departmentId);
        }
      }
    }
  }, [open, patient, alert]);

  const fetchDeptsAndDoctors = async () => {
    setLoading(true);
    try {
      const [deptRes, docRes] = await Promise.all([
        hospitalApi.getDepartments(),
        hospitalApi.getDoctors(),
      ]);
      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (docRes.success) setDoctors(docRes.doctors || []);
    } catch (err) {
      message.error('Failed to load clinical staff directory.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = selectedDeptId
    ? doctors.filter((doc) => doc.departmentId?._id === selectedDeptId || doc.departmentId === selectedDeptId)
    : doctors;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        patientId: patient?._id,
        doctorId: values.doctorId,
        departmentId: values.departmentId,
        alertId: alert?._id,
        reportId: report?._id,
        priority: values.priority,
        hospitalNote: values.hospitalNote,
      };

      const res = await hospitalApi.assignDoctor(payload);
      if (res.success) {
        message.success(`Assigned ${patient?.name} successfully.`);
        if (onSuccess) onSuccess(res);
        onClose();
      }
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Failed to complete doctor assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F172A', fontSize: 17 }}>
          <MedicineBoxOutlined style={{ color: '#6D28D9', fontSize: 20 }} />
          <span>Doctor Assignment Workflow</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Assign Doctor"
      okButtonProps={{ loading: submitting, style: { backgroundColor: '#6D28D9', borderColor: '#6D28D9' } }}
      cancelText="Cancel"
      width={640}
      destroyOnClose
    >
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {/* Patient and Reason Context Card */}
          <div
            style={{
              backgroundColor: '#F3EEFF',
              border: '1px solid #DDD6FE',
              borderRadius: 10,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>
                  Target Patient
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                  {patient?.name || 'Patient'} ({patient?.patientId || 'PT-ID'})
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                  {patient?.age} yrs • {patient?.gender} • Blood Group: <Tag color="purple">{patient?.bloodGroup || 'O+'}</Tag>
                </div>
              </div>

              {alert && (
                <Tag color={alert.severity === 'Critical' ? 'red' : 'gold'} style={{ padding: '4px 8px', fontSize: 12, backgroundColor: alert.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7', color: alert.severity === 'Critical' ? '#DC2626' : '#B45309' }}>
                  <AlertOutlined /> {alert.parameter}: {alert.value}
                </Tag>
              )}
            </div>

            {patient?.conditions && patient.conditions.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
                <strong style={{ color: '#0F172A' }}>Recorded Conditions:</strong> {patient.conditions.join(', ')}
              </div>
            )}
          </div>

          <Form form={form} layout="vertical" initialValues={{ priority: 'High' }}>
            {/* Department Filter */}
            <Form.Item
              name="departmentId"
              label={<span style={{ fontWeight: 600, color: '#0F172A' }}>Clinical Department</span>}
              rules={[{ required: true, message: 'Please select a clinical department' }]}
            >
              <Select
                placeholder="Select Department"
                size="large"
                onChange={(val) => {
                  setSelectedDeptId(val);
                  form.setFieldsValue({ doctorId: undefined });
                }}
              >
                {departments.map((dept) => (
                  <Option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code}) — Floor {dept.floor || '1'}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Doctor Selection */}
            <Form.Item
              name="doctorId"
              label={<span style={{ fontWeight: 600, color: '#0F172A' }}>Assign Available Doctor</span>}
              rules={[{ required: true, message: 'Please select a qualified doctor' }]}
            >
              <Select placeholder="Choose attending physician" size="large" showSearch optionFilterProp="label">
                {filteredDoctors.map((doc) => {
                  const isAvail = doc.availabilityStatus === 'Available';
                  return (
                    <Option
                      key={doc._id}
                      value={doc._id}
                      label={`${doc.name} ${doc.specialization}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar size={24} src={doc.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#6D28D9' }} />
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{doc.name}</span>
                          <span style={{ fontSize: 12, color: '#475569' }}>({doc.specialization})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tag color={isAvail ? 'green' : 'orange'} style={{ margin: 0, fontSize: 11 }}>
                            {doc.availabilityStatus}
                          </Tag>
                          <span style={{ fontSize: 11, color: '#475569' }}>
                            {doc.todayPatientsCount || 0} pts
                          </span>
                        </div>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Priority */}
            <Form.Item
              name="priority"
              label={<span style={{ fontWeight: 600, color: '#0F172A' }}>Assignment Priority</span>}
              rules={[{ required: true }]}
            >
              <Radio.Group buttonStyle="solid" size="middle">
                <Radio.Button value="Urgent" style={{ color: '#DC2626' }}>
                  Urgent / Stat
                </Radio.Button>
                <Radio.Button value="High" style={{ color: '#F59E0B' }}>
                  High Priority
                </Radio.Button>
                <Radio.Button value="Standard">Standard</Radio.Button>
                <Radio.Button value="Routine">Routine</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Hospital Note */}
            <Form.Item
              name="hospitalNote"
              label={<span style={{ fontWeight: 600, color: '#0F172A' }}>Hospital Administrator Note & Clinical Context</span>}
            >
              <TextArea
                rows={3}
                placeholder="Add clinical coordination notes, laboratory summary highlights, or urgent care instructions for the attending physician..."
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default DoctorAssignmentModal;
