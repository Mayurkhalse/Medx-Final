import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  trend,
  trendType = 'positive',
  icon,
  iconBg = '#F3EEFF',
  iconColor = '#6D28D9',
  to,
  subtitle,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      className="medx-card stat-card-glow"
      hoverable
      onClick={() => to && navigate(to)}
      style={{
        borderRadius: 12,
        height: '100%',
        cursor: to ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
      }}
      bodyStyle={{ padding: '20px 22px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text style={{ fontSize: 13, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </Text>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#0F172A',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.1,
              }}
            >
              {value}
            </span>
          </div>

          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            {trend && (
              <span
                style={{
                  color: trendType === 'positive' ? '#16A34A' : '#DC2626',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <ArrowUpOutlined style={{ fontSize: 11 }} />
                {trend}
              </span>
            )}
            {subtitle && <span style={{ color: '#475569' }}>{subtitle}</span>}
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: `0 4px 12px ${iconColor}20`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      {to && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#6D28D9',
            fontWeight: 700,
          }}
        >
          <span>View details</span>
          <ArrowRightOutlined style={{ fontSize: 11 }} />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
