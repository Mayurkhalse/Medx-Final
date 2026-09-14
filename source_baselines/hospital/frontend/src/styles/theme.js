export const medxTheme = {
  token: {
    colorPrimary: '#6D28D9',       // Bright Purple
    colorPrimaryHover: '#5B21B6',  // Darker Purple Hover
    colorPrimaryActive: '#4C1D95', // Deep Purple
    colorInfo: '#2563EB',          // Info Blue
    colorSuccess: '#16A34A',       // Success Green
    colorWarning: '#F59E0B',       // Warning Amber
    colorError: '#DC2626',         // Critical/Error Red
    colorTextBase: '#0F172A',      // Dark Navy Text
    colorTextSecondary: '#475569', // Gray-Blue Secondary Text
    colorBgBase: '#FFFFFF',        // Card Background
    colorBgLayout: '#F5F6FA',      // Page Background
    colorBorder: '#E2E8F0',        // Border Light Gray
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)',
    boxShadowSecondary: '0 4px 16px 0 rgba(109, 40, 217, 0.08)',
  },
  components: {
    Layout: {
      bodyBg: '#F5F6FA',
      headerBg: '#FFFFFF',
      siderBg: '#0F172A',
    },
    Card: {
      headerFontSize: 16,
      headerHeight: 52,
      borderRadiusLG: 12,
      colorBorderSecondary: '#E2E8F0',
    },
    Button: {
      controlHeight: 38,
      borderRadius: 8,
      fontWeight: 600,
      primaryColor: '#FFFFFF',
      colorPrimary: '#6D28D9',
      colorPrimaryHover: '#5B21B6',
      colorPrimaryActive: '#4C1D95',
    },
    Table: {
      headerBg: '#F3EEFF',
      headerColor: '#0F172A',
      rowHoverBg: '#F8F6FF',
      borderRadiusLG: 10,
      borderColor: '#E2E8F0',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkItemSelectedBg: '#6D28D9',
      darkItemSelectedColor: '#FFFFFF',
      itemBorderRadius: 8,
      itemMarginInline: 10,
    },
    Tabs: {
      titleFontSize: 15,
      itemSelectedColor: '#6D28D9',
      inkBarColor: '#6D28D9',
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Radio: {
      colorPrimary: '#6D28D9',
    },
    Select: {
      colorPrimary: '#6D28D9',
      colorPrimaryHover: '#5B21B6',
    },
    Input: {
      colorPrimary: '#6D28D9',
      colorPrimaryHover: '#5B21B6',
    },
  },
};
