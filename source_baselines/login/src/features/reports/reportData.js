export const reports = [
  {
    id: 'RPT-2026-0822',
    title: 'Complete Blood Count',
    shortTitle: 'CBC',
    date: '22 Aug 2026',
    uploaded: '22 Aug 2026, 10:42 AM',
    status: 'Processed',
    testCount: 8,
    source: 'Laboratory report',
    summary:
      'Blood count parameters extracted from the uploaded laboratory report.',
    results: [
      {
        name: 'Hemoglobin',
        value: '13.8',
        unit: 'g/dL',
        reference: '13.0 – 17.0',
        status: 'Normal',
        category: 'Blood count'
      },
      {
        name: 'RBC Count',
        value: '4.72',
        unit: 'million/µL',
        reference: '4.5 – 5.5',
        status: 'Normal',
        category: 'Blood count'
      },
      {
        name: 'WBC Count',
        value: '8.4',
        unit: 'thousand/µL',
        reference: '4.0 – 11.0',
        status: 'Normal',
        category: 'Blood count'
      },
      {
        name: 'Platelet Count',
        value: '248',
        unit: 'thousand/µL',
        reference: '150 – 450',
        status: 'Normal',
        category: 'Blood count'
      },
      {
        name: 'Hematocrit',
        value: '41.2',
        unit: '%',
        reference: '40 – 50',
        status: 'Normal',
        category: 'Blood count'
      },
      {
        name: 'MCV',
        value: '87.3',
        unit: 'fL',
        reference: '80 – 100',
        status: 'Normal',
        category: 'Red cell indices'
      },
      {
        name: 'MCH',
        value: '29.2',
        unit: 'pg',
        reference: '27 – 33',
        status: 'Normal',
        category: 'Red cell indices'
      },
      {
        name: 'RDW',
        value: '13.1',
        unit: '%',
        reference: '11.5 – 14.5',
        status: 'Normal',
        category: 'Red cell indices'
      }
    ]
  },

  {
    id: 'RPT-2026-0815',
    title: 'Metabolic Panel',
    shortTitle: 'Metabolic Panel',
    date: '15 Aug 2026',
    uploaded: '15 Aug 2026, 09:18 AM',
    status: 'Processed',
    testCount: 6,
    source: 'Laboratory report',
    summary:
      'Selected metabolic measurements extracted from the uploaded report.',
    results: [
      {
        name: 'Fasting Glucose',
        value: '96',
        unit: 'mg/dL',
        reference: '70 – 99',
        status: 'Normal',
        category: 'Glucose'
      },
      {
        name: 'Creatinine',
        value: '0.9',
        unit: 'mg/dL',
        reference: '0.7 – 1.3',
        status: 'Normal',
        category: 'Kidney function'
      },
      {
        name: 'Urea',
        value: '28',
        unit: 'mg/dL',
        reference: '15 – 40',
        status: 'Normal',
        category: 'Kidney function'
      },
      {
        name: 'Sodium',
        value: '139',
        unit: 'mmol/L',
        reference: '135 – 145',
        status: 'Normal',
        category: 'Electrolytes'
      },
      {
        name: 'Potassium',
        value: '4.3',
        unit: 'mmol/L',
        reference: '3.5 – 5.1',
        status: 'Normal',
        category: 'Electrolytes'
      },
      {
        name: 'ALT',
        value: '31',
        unit: 'U/L',
        reference: '7 – 56',
        status: 'Normal',
        category: 'Liver function'
      }
    ]
  },

  {
    id: 'RPT-2026-0802',
    title: 'Lipid Profile',
    shortTitle: 'Lipid Profile',
    date: '02 Aug 2026',
    uploaded: '02 Aug 2026, 04:35 PM',
    status: 'Processed',
    testCount: 5,
    source: 'Laboratory report',
    summary:
      'Cholesterol and lipid measurements extracted from the uploaded report.',
    results: [
      {
        name: 'Total Cholesterol',
        value: '186',
        unit: 'mg/dL',
        reference: '< 200',
        status: 'Normal',
        category: 'Cholesterol'
      },
      {
        name: 'LDL Cholesterol',
        value: '112',
        unit: 'mg/dL',
        reference: '< 100',
        status: 'Attention',
        category: 'Cholesterol'
      },
      {
        name: 'HDL Cholesterol',
        value: '52',
        unit: 'mg/dL',
        reference: '> 40',
        status: 'Normal',
        category: 'Cholesterol'
      },
      {
        name: 'Triglycerides',
        value: '108',
        unit: 'mg/dL',
        reference: '< 150',
        status: 'Normal',
        category: 'Triglycerides'
      },
      {
        name: 'VLDL',
        value: '22',
        unit: 'mg/dL',
        reference: '5 – 40',
        status: 'Normal',
        category: 'Lipoproteins'
      }
    ]
  }
];

export const getReportById = (id) =>
  reports.find((report) => report.id === id);
