/**
 * Minimal Backend Server - Pure JavaScript, no TypeScript
 * This should ALWAYS work!
 * Using ES Module syntax (import) because package.json has "type": "module"
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For query parameters

// Request logging middleware for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/regulatory-updates')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      query: req.query,
      params: req.params,
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer
      }
    });
  }
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'minimal-server-js',
    database: 'mock'
  });
});

// Test endpoint for debugging proxy issues
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint works!',
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unhealthy',
      redis: 'healthy',
      externalApis: 'healthy'
    }
  });
});

// Dashboard Stats - EXAKT wie Live-Version (www.deltaways-helix.de)
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUpdates: 292,  // Live: 292 (nicht 24!)
      totalLegalCases: 65,  // Live: 65 ✅
      fdaData: 101,  // Live: 101 ✅
      dataSources: 72,  // Live: 72 (Dashboard), 46 (Sidebar)
      activeDataSources: 72,  // Live: 70-72
      aiInsights: 24,  // Live: 24/7
      approvals: 6,  // Live: 6 ✅
      lastSync: new Date().toISOString(),
      status: 'online',
      recentActivity: [
        { type: 'FDA Approval', count: 5, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { type: 'Regulatory Update', count: 292, timestamp: new Date().toISOString() },
        { type: 'Legal Case', count: 65, timestamp: new Date().toISOString() }
      ],
      compliance: {
        score: 100,  // Live: 100% Data Quality
        status: 'excellent',
        lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// FDA Approvals - EXAKT wie Live-Version (www.deltaways-helix.de)
app.get('/api/fda/approvals', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        deviceName: 'Venclose digiRF Generator',
        device_name: 'Venclose digiRF Generator',
        product_name: 'Venclose digiRF Generator (VCRFG1); Venclose EVSRF Catheter (VC10A256F60, VC10A256F100)',
        applicant: 'Venclose Inc.',
        manufacturer_name: 'Venclose Inc.',
        productCode: 'VCRFG1',
        product_code: 'VCRFG1',
        decision: 'Cleared',
        decisionDate: '2025-08-19',
        decision_date: '2025-08-19',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K252316',
        submission_number: 'K252316',
        submission_status: 'Cleared',
        submission_date: '2025-08-19',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR',
        description: 'Venclose digiRF Generator (VCRFG1); Venclose EVSRF Catheter (VC10A256F60, VC10A256F100)'
      },
      {
        id: '2',
        deviceName: 'GBrain MRI',
        device_name: 'GBrain MRI',
        product_name: 'GBrain MRI',
        applicant: 'GBrain Technologies',
        manufacturer_name: 'GBrain Technologies',
        productCode: 'GBMRI',
        product_code: 'GBMRI',
        decision: 'Cleared',
        decisionDate: '2025-08-22',
        decision_date: '2025-08-22',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K252362',
        submission_number: 'K252362',
        submission_status: 'Cleared',
        submission_date: '2025-08-22',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR',
        description: 'GBrain MRI'
      },
      {
        id: '3',
        deviceName: 'The Acumed Wrist Fixation System - 2.4mm Screws',
        device_name: 'The Acumed Wrist Fixation System - 2.4mm Screws',
        product_name: 'The Acumed Wrist Fixation System - 2.4mm Screws',
        applicant: 'Acumed LLC',
        manufacturer_name: 'Acumed LLC',
        productCode: 'ACU-WRIST',
        product_code: 'ACU-WRIST',
        decision: 'Cleared',
        decisionDate: '2025-08-21',
        decision_date: '2025-08-21',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K252356',
        submission_number: 'K252356',
        submission_status: 'Cleared',
        submission_date: '2025-08-21',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR',
        description: 'The Acumed Wrist Fixation System - 2.4mm Screws'
      },
      {
        id: '4',
        deviceName: 'MF SC GEN2 Facial Toning System',
        device_name: 'MF SC GEN2 Facial Toning System',
        product_name: 'MF SC GEN2 Facial Toning System',
        applicant: 'MF Technologies',
        manufacturer_name: 'MF Technologies',
        productCode: 'MF-SC-GEN2',
        product_code: 'MF-SC-GEN2',
        decision: 'Cleared',
        decisionDate: '2025-07-18',
        decision_date: '2025-07-18',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K252218',
        submission_number: 'K252218',
        submission_status: 'Cleared',
        submission_date: '2025-07-18',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR',
        description: 'MF SC GEN2 Facial Toning System'
      },
      {
        id: '5',
        deviceName: 'InVision 3T Recharge Operating Suite',
        device_name: 'InVision 3T Recharge Operating Suite',
        product_name: 'InVision 3T Recharge Operating Suite',
        applicant: 'InVision Medical',
        manufacturer_name: 'InVision Medical',
        productCode: 'INV-3T',
        product_code: 'INV-3T',
        decision: 'Cleared',
        decisionDate: '2025-08-06',
        decision_date: '2025-08-06',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K252239',
        submission_number: 'K252239',
        submission_status: 'Cleared',
        submission_date: '2025-08-06',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR',
        description: 'InVision 3T Recharge Operating Suite'
      }
    ],
    count: 5,
    timestamp: new Date().toISOString()
  });
});

// FDA Events
app.get('/api/fda/events', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        productName: 'InsulinPump X2000',
        device_name: 'InsulinPump X2000',
        brand_name: 'InsulinPump X2000',
        eventType: 'Malfunction',
        event_type: 'Malfunction',
        severity: 'Serious',
        reportDate: '2024-03-10',
        event_date: '2024-03-10',
        report_date: '2024-03-10',
        report_number: 'MAUDE-2024-001234',
        description: 'Device malfunction reported during normal use - insulin delivery interrupted',
        event_description: 'Device malfunction reported during normal use - insulin delivery interrupted',
        reporter: 'Healthcare Professional',
        manufacturer_name: 'MedTech Insulin Systems',
        model_number: 'X2000',
        device_class: 'III',
        patient_age: '45',
        patient_sex: 'M',
        adverse_event_flag: 'Y',
        product_problem_flag: 'Y',
        patientOutcome: 'Required Medical Intervention'
      },
      {
        id: '2',
        productName: 'HeartValve ProSeries',
        device_name: 'HeartValve ProSeries',
        brand_name: 'HeartValve ProSeries',
        eventType: 'Device Failure',
        event_type: 'Device Failure',
        severity: 'Critical',
        reportDate: '2024-02-28',
        event_date: '2024-02-28',
        report_date: '2024-02-28',
        report_number: 'MAUDE-2024-001567',
        description: 'Valve leaflet tear detected during routine follow-up',
        event_description: 'Valve leaflet tear detected during routine follow-up',
        reporter: 'Physician',
        manufacturer_name: 'CardioValve Technologies',
        model_number: 'ProSeries-2023',
        device_class: 'III',
        patient_age: '62',
        patient_sex: 'F',
        adverse_event_flag: 'Y',
        product_problem_flag: 'Y',
        patientOutcome: 'Device Replacement Required'
      },
      {
        id: '3',
        productName: 'OrthoJoint Implant',
        device_name: 'OrthoJoint Implant',
        brand_name: 'OrthoJoint Implant',
        eventType: 'Material Issue',
        event_type: 'Material Issue',
        severity: 'Moderate',
        reportDate: '2024-03-15',
        event_date: '2024-03-15',
        report_date: '2024-03-15',
        report_number: 'MAUDE-2024-001890',
        description: 'Premature wear of implant surface observed',
        event_description: 'Premature wear of implant surface observed',
        reporter: 'Healthcare Facility',
        manufacturer_name: 'OrthoMed Solutions',
        model_number: 'OJ-2024',
        device_class: 'II',
        patient_age: '58',
        patient_sex: 'M',
        adverse_event_flag: 'N',
        product_problem_flag: 'Y',
        patientOutcome: 'Monitoring Required'
      }
    ],
    count: 3,
    timestamp: new Date().toISOString()
  });
});

// FDA Recalls
app.get('/api/fda/recalls', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        productName: 'Blood Glucose Monitor Series A',
        product_description: 'Blood Glucose Monitor Series A',
        recallNumber: 'Z-1234-2024',
        recall_number: 'Z-1234-2024',
        recallDate: '2024-02-28',
        recall_date: '2024-02-28',
        classification: 'Class II',
        reason: 'Inaccurate readings under certain conditions - temperature sensitivity',
        reason_for_recall: 'Inaccurate readings under certain conditions - temperature sensitivity',
        status: 'Ongoing',
        recall_status: 'Ongoing',
        unitsAffected: 15000,
        product_quantity: '15000 units',
        manufacturer: 'GlucoTech Systems',
        manufacturer_name: 'GlucoTech Systems',
        distribution_pattern: 'Nationwide',
        code_info: 'Lot numbers: A2024-001 through A2024-150'
      },
      {
        id: '2',
        productName: 'Surgical Stapler Model X',
        product_description: 'Surgical Stapler Model X',
        recallNumber: 'Z-1567-2024',
        recall_number: 'Z-1567-2024',
        recallDate: '2024-03-12',
        recall_date: '2024-03-12',
        classification: 'Class I',
        reason: 'Potential for staple malformation leading to incomplete wound closure',
        reason_for_recall: 'Potential for staple malformation leading to incomplete wound closure',
        status: 'Completed',
        recall_status: 'Completed',
        unitsAffected: 8500,
        product_quantity: '8500 units',
        manufacturer: 'SurgiTech Devices',
        manufacturer_name: 'SurgiTech Devices',
        distribution_pattern: 'Nationwide',
        code_info: 'Serial numbers: STX-2023-5000 through STX-2023-13500'
      },
      {
        id: '3',
        productName: 'Infusion Pump ProFlow',
        product_description: 'Infusion Pump ProFlow',
        recallNumber: 'Z-1889-2024',
        recall_number: 'Z-1889-2024',
        recallDate: '2024-03-25',
        recall_date: '2024-03-25',
        classification: 'Class II',
        reason: 'Software error may cause incorrect dosage delivery',
        reason_for_recall: 'Software error may cause incorrect dosage delivery',
        status: 'Ongoing',
        recall_status: 'Ongoing',
        unitsAffected: 22000,
        product_quantity: '22000 units',
        manufacturer: 'MedFlow Technologies',
        manufacturer_name: 'MedFlow Technologies',
        distribution_pattern: 'Nationwide',
        code_info: 'Software versions: v2.1.0 through v2.3.5'
      }
    ],
    count: 3,
    timestamp: new Date().toISOString()
  });
});

// FDA All Data
app.get('/api/fda/all', (req, res) => {
  res.json({
    success: true,
    data: {
      approvals: [],
      events: [],
      recalls: [],
      summary: {
        totalApprovals: 5,
        totalEvents: 3,
        totalRecalls: 3,
        lastUpdated: new Date().toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// FDA Stats
app.get('/api/fda/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalApprovals: 5,
      activeRecalls: 2,
      criticalRecalls: 1,
      adverseEvents: 3,
      complianceScore: 85,
      lastUpdated: new Date().toISOString(),
      totalEvents: 3,
      totalRecalls: 3,
      recentApprovals: [],
      lastSync: new Date().toISOString(),
      status: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Regulatory Updates - EXAKT wie Live-Version (www.deltaways-helix.de)
// Vollständige Datenstruktur mit allen Frontend-erwarteten Feldern
app.get('/api/regulatory-updates', (req, res) => {
  try {
  const updates = [
    {
      id: '1',
      title: 'FDA 510(k): Venclose digiRF Generator (VCRFG1); Venclose EVSRF Catheter (VC10A256F60, VC10A256F100) (K252316)',
      description: 'FDA 510(k) clearance for Venclose digiRF Generator and EVSRF Catheter',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/venclose-digirf-generator-k252316',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-19T00:00:00Z',
      published_date: '2025-08-19',
      date: '2025-08-19',
      created_at: '2025-08-19T00:00:00Z',
      submission_number: 'K252316',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '2',
      title: 'FDA 510(k): GBrain MRI (K252362)',
      description: 'FDA 510(k) clearance for GBrain MRI system',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/gbrain-mri-k252362',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-22T00:00:00Z',
      published_date: '2025-08-22',
      date: '2025-08-22',
      created_at: '2025-08-22T00:00:00Z',
      submission_number: 'K252362',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '3',
      title: 'FDA 510(k): The Acumed Wrist Fixation System - 2.4mm Screws (K252356)',
      description: 'FDA 510(k) clearance for Acumed Wrist Fixation System',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/acumed-wrist-fixation-k252356',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-21T00:00:00Z',
      published_date: '2025-08-21',
      date: '2025-08-21',
      created_at: '2025-08-21T00:00:00Z',
      submission_number: 'K252356',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '4',
      title: 'FDA 510(k): MF SC GEN2 Facial Toning System (K252218)',
      description: 'FDA 510(k) clearance for MF SC GEN2 Facial Toning System',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/mf-sc-gen2-facial-toning-k252218',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-07-18T00:00:00Z',
      published_date: '2025-07-18',
      date: '2025-07-18',
      created_at: '2025-07-18T00:00:00Z',
      submission_number: 'K252218',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '5',
      title: 'FDA 510(k): InVision 3T Recharge Operating Suite (K252239)',
      description: 'FDA 510(k) clearance for InVision 3T Recharge Operating Suite',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/invision-3t-recharge-k252239',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-06T00:00:00Z',
      published_date: '2025-08-06',
      date: '2025-08-06',
      created_at: '2025-08-06T00:00:00Z',
      submission_number: 'K252239',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    }
  ];
  
    res.json({
      success: true,
      data: updates,
      count: updates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error in /api/regulatory-updates:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/regulatory-updates/recent', (req, res) => {
  try {
    // Support limit query parameter - handle both string and number
    const limitParam = req.query.limit || req.query['limit'];
    const limit = limitParam ? parseInt(String(limitParam), 10) : 5000;
  
  const updates = [
    {
      id: '1',
      title: 'FDA 510(k): Venclose digiRF Generator (VCRFG1); Venclose EVSRF Catheter (VC10A256F60, VC10A256F100) (K252316)',
      description: 'FDA 510(k) clearance for Venclose digiRF Generator and EVSRF Catheter',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/venclose-digirf-generator-k252316',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-19T00:00:00Z',
      published_date: '2025-08-19',
      date: '2025-08-19',
      created_at: '2025-08-19T00:00:00Z',
      submission_number: 'K252316',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '2',
      title: 'FDA 510(k): GBrain MRI (K252362)',
      description: 'FDA 510(k) clearance for GBrain MRI system',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/gbrain-mri-k252362',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-22T00:00:00Z',
      published_date: '2025-08-22',
      date: '2025-08-22',
      created_at: '2025-08-22T00:00:00Z',
      submission_number: 'K252362',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '3',
      title: 'FDA 510(k): The Acumed Wrist Fixation System - 2.4mm Screws (K252356)',
      description: 'FDA 510(k) clearance for Acumed Wrist Fixation System',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/acumed-wrist-fixation-k252356',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-21T00:00:00Z',
      published_date: '2025-08-21',
      date: '2025-08-21',
      created_at: '2025-08-21T00:00:00Z',
      submission_number: 'K252356',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '4',
      title: 'FDA 510(k): MF SC GEN2 Facial Toning System (K252218)',
      description: 'FDA 510(k) clearance for MF SC GEN2 Facial Toning System',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/mf-sc-gen2-facial-toning-k252218',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-07-18T00:00:00Z',
      published_date: '2025-07-18',
      date: '2025-07-18',
      created_at: '2025-07-18T00:00:00Z',
      submission_number: 'K252218',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    },
    {
      id: '5',
      title: 'FDA 510(k): InVision 3T Recharge Operating Suite (K252239)',
      description: 'FDA 510(k) clearance for InVision 3T Recharge Operating Suite',
      source: 'FDA',
      source_id: 'fda_510k',
      source_url: 'https://www.fda.gov/medical-devices/510k-clearances/invision-3t-recharge-k252239',
      region: 'USA',
      update_type: 'fda_510k',
      type: 'fda_510k',
      priority: 'high',
      published_at: '2025-08-06T00:00:00Z',
      published_date: '2025-08-06',
      date: '2025-08-06',
      created_at: '2025-08-06T00:00:00Z',
      submission_number: 'K252239',
      status: 'published',
      device_classes: [],
      categories: { type: 'fda_510k', region: 'USA' },
      content: null,
      raw_data: null
    }
  ];
  
    res.json({
      success: true,
      data: updates.slice(0, limit),
      count: updates.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error in /api/regulatory-updates/recent:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Legal Cases
app.get('/api/legal-cases', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Approvals
app.get('/api/approvals', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/approvals/pending', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Data Sources - EXAKT wie Live-Version (7 Newsletter Sources + 72 Data Sources)
app.get('/api/data-sources', (req, res) => {
  res.json([
    {
      id: 'ds_1',
      name: 'FDA News & Updates',
      type: 'regulatory',
      category: 'regulatory',
      region: 'US',
      endpoint: 'https://www.fda.gov/news-events/fda-newsroom',
      description: 'Offizielle FDA Updates',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'hourly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_2',
      name: 'EMA Newsletter',
      type: 'regulatory',
      category: 'regulatory',
      region: 'EU',
      endpoint: 'https://www.ema.europa.eu',
      description: 'Europäische Arzneimittel-Agentur',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'hourly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_3',
      name: 'MedTech Dive',
      type: 'newsletter',
      category: 'newsletter',
      region: 'Global',
      endpoint: 'https://www.medtechdive.com',
      description: 'Medizintechnik-Industrie News',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_4',
      name: 'RAPS Newsletter',
      type: 'newsletter',
      category: 'newsletter',
      region: 'Global',
      endpoint: 'https://www.raps.org',
      description: 'Regulatory Affairs Updates',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_5',
      name: 'Medical Device Industry',
      type: 'newsletter',
      category: 'newsletter',
      region: 'Global',
      endpoint: 'https://www.medicaldevice-industry.com',
      description: 'Technische Nachrichten',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_6',
      name: 'BfArM Aktuell',
      type: 'regulatory',
      category: 'regulatory',
      region: 'DE',
      endpoint: 'https://www.bfarm.de',
      description: 'Deutsche Behörden-Updates',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ds_7',
      name: 'MedTech Europe',
      type: 'newsletter',
      category: 'newsletter',
      region: 'EU',
      endpoint: 'https://www.medtecheurope.org',
      description: 'Policy und Markttrends',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Helix Regulatory Intelligence Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'running',
    mode: 'minimal-server-js',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      dashboard: '/api/dashboard/stats',
      fdaApprovals: '/api/fda/approvals',
      fdaEvents: '/api/fda/events',
      fdaRecalls: '/api/fda/recalls'
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  const startTime = new Date().toISOString();
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Minimal Backend Server Started (JavaScript)');
  console.log(`   Port: ${PORT}`);
  console.log(`   Host: ${HOST}`);
  console.log(`   Mode: Minimal Server (Mock Data)`);
  console.log(`   Started: ${startTime}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📡 Available Endpoints:');
  console.log(`   Health:     http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
  console.log(`   Dashboard:  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/dashboard/stats`);
  console.log(`   FDA:        http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/fda/approvals`);
  console.log('');
  console.log('⚠️  Running with MOCK DATA - No database connection required');
  console.log('');
  console.log('💡 TIPP: Wenn diese Meldung mehrfach erscheint,');
  console.log('   schließe alle anderen PowerShell-Fenster, die das Backend starten!');
  console.log('');
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Backend wird beendet...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('🛑 Backend wird beendet...');
  process.exit(0);
});

