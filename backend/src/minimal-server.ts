/**
 * Minimal Backend Server - Fallback wenn das Haupt-Backend nicht startet
 * Dieses Server hat keine Dependencies außer Express und sollte IMMER funktionieren
 */

import * as express from 'express';
import * as cors from 'cors';

type Application = express.Application;
type Request = express.Request;
type Response = express.Response;

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'minimal-server',
    database: 'mock'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
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

// Dashboard Stats
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalUpdates: 24,
      totalLegalCases: 65,
      fdaData: 101,
      dataSources: 7,
      activeDataSources: 7,
      aiInsights: 24,
      approvals: 6,
      lastSync: new Date().toISOString(),
      status: 'online',
      recentActivity: [
        { type: 'FDA Approval', count: 3, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { type: 'Regulatory Update', count: 24, timestamp: new Date().toISOString() },
        { type: 'Legal Case', count: 65, timestamp: new Date().toISOString() }
      ],
      compliance: {
        score: 98,
        status: 'excellent',
        lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    timestamp: new Date().toISOString()
  });
});

// FDA Approvals
app.get('/api/fda/approvals', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        deviceName: 'CardioMonitor Pro',
        device_name: 'CardioMonitor Pro',
        product_name: 'CardioMonitor Pro',
        applicant: 'MedTech Solutions Inc.',
        manufacturer_name: 'MedTech Solutions Inc.',
        productCode: 'DXH',
        product_code: 'DXH',
        decision: 'Approved',
        decisionDate: '2024-01-15',
        decision_date: '2024-01-15',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K240015',
        submission_number: 'K240015',
        submission_status: 'Cleared',
        submission_date: '2024-01-10',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR 870.1025',
        description: 'Advanced cardiac monitoring device with AI-powered arrhythmia detection'
      },
      {
        id: '2',
        deviceName: 'SurgiGuide Navigation System',
        device_name: 'SurgiGuide Navigation System',
        product_name: 'SurgiGuide Navigation System',
        applicant: 'Advanced Surgical Systems',
        manufacturer_name: 'Advanced Surgical Systems',
        productCode: 'OZO',
        product_code: 'OZO',
        decision: 'Approved',
        decisionDate: '2024-02-20',
        decision_date: '2024-02-20',
        type: 'PMA',
        submission_type: 'PMA',
        fdaNumber: 'P240002',
        submission_number: 'P240002',
        submission_status: 'Approved',
        submission_date: '2023-11-15',
        decision_code: 'A',
        decision_description: 'PMA Approved',
        device_class: 'III',
        regulation_number: '21 CFR 888.1500',
        description: 'Real-time surgical navigation system for orthopedic procedures'
      },
      {
        id: '3',
        deviceName: 'NeuroStim Implant',
        device_name: 'NeuroStim Implant',
        product_name: 'NeuroStim Implant',
        applicant: 'NeuroTech Innovations',
        manufacturer_name: 'NeuroTech Innovations',
        productCode: 'GZB',
        product_code: 'GZB',
        decision: 'Approved',
        decisionDate: '2024-03-05',
        decision_date: '2024-03-05',
        type: 'PMA',
        submission_type: 'PMA',
        fdaNumber: 'P240003',
        submission_number: 'P240003',
        submission_status: 'Approved',
        submission_date: '2023-12-01',
        decision_code: 'A',
        decision_description: 'PMA Approved',
        device_class: 'III',
        regulation_number: '21 CFR 882.5800',
        description: 'Implantable neurostimulation device for chronic pain management'
      },
      {
        id: '4',
        deviceName: 'BloodFlow Analyzer',
        device_name: 'BloodFlow Analyzer',
        product_name: 'BloodFlow Analyzer',
        applicant: 'Diagnostic Systems Corp',
        manufacturer_name: 'Diagnostic Systems Corp',
        productCode: 'KSK',
        product_code: 'KSK',
        decision: 'Approved',
        decisionDate: '2024-03-18',
        decision_date: '2024-03-18',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K240028',
        submission_number: 'K240028',
        submission_status: 'Cleared',
        submission_date: '2024-02-15',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR 870.1100',
        description: 'Non-invasive blood flow measurement system'
      },
      {
        id: '5',
        deviceName: 'OptiVision Surgical Camera',
        device_name: 'OptiVision Surgical Camera',
        product_name: 'OptiVision Surgical Camera',
        applicant: 'VisionMed Technologies',
        manufacturer_name: 'VisionMed Technologies',
        productCode: 'HDE',
        product_code: 'HDE',
        decision: 'Approved',
        decisionDate: '2024-04-02',
        decision_date: '2024-04-02',
        type: '510(k)',
        submission_type: '510(k)',
        fdaNumber: 'K240035',
        submission_number: 'K240035',
        submission_status: 'Cleared',
        submission_date: '2024-03-01',
        decision_code: 'K',
        decision_description: '510(k) Cleared',
        device_class: 'II',
        regulation_number: '21 CFR 878.4340',
        description: '4K surgical camera with enhanced visualization capabilities'
      }
    ],
    count: 5,
    timestamp: new Date().toISOString()
  });
});

// FDA Events
app.get('/api/fda/events', (req: Request, res: Response) => {
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
app.get('/api/fda/recalls', (req: Request, res: Response) => {
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
app.get('/api/fda/all', (req: Request, res: Response) => {
  // This would combine all FDA data, but for now just return structure
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
app.get('/api/fda/stats', (req: Request, res: Response) => {
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

// Regulatory Updates
app.get('/api/regulatory-updates', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/regulatory-updates/recent', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Legal Cases
app.get('/api/legal-cases', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Approvals
app.get('/api/approvals', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/approvals/pending', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Data Sources
app.get('/api/data-sources', (req: Request, res: Response) => {
  res.json([
    {
      id: 'ds_1',
      name: 'FDA News & Updates',
      type: 'regulatory',
      category: 'regulatory',
      region: 'US',
      endpoint: 'https://www.fda.gov/news-events/fda-newsroom',
      description: 'FDA News and Updates',
      status: 'active',
      isActive: true,
      lastSync: new Date().toISOString(),
      syncFrequency: 'hourly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Helix Regulatory Intelligence Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'running',
    mode: 'minimal-server',
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
  console.log('');
  console.log('✅ Minimal Backend Server Started');
  console.log(`   Port: ${PORT}`);
  console.log(`   Host: ${HOST}`);
  console.log(`   Mode: Minimal Server (Mock Data)`);
  console.log('');
  console.log('📡 Available Endpoints:');
  console.log(`   Health:     http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
  console.log(`   Dashboard:  http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/dashboard/stats`);
  console.log(`   FDA:        http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/fda/approvals`);
  console.log('');
  console.log('⚠️  Running with MOCK DATA - No database connection required');
  console.log('');
});

