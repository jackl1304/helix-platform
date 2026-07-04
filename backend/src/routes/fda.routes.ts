import { Router, Request, Response } from 'express';
import { Logger } from '../services/logger.service';
import { tenantIsolationMiddleware } from '../middleware/tenant-isolation';

const router = Router();
const logger = new Logger('FDA-Routes');

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// ==========================================
// FDA MOCK DATA (Placeholder)
// ==========================================

const mockFDAApprovals = [
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
];

const mockFDAEvents = [
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
];

const mockFDARecalls = [
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
];

// ==========================================
// GET ROUTES
// ==========================================

/**
 * GET /api/fda/approvals
 * Get FDA device approvals
 */
router.get('/approvals', async (req: Request, res: Response) => {
  try {
    logger.info('FDA approvals requested');
    
    res.json({
      success: true,
      data: mockFDAApprovals,
      count: mockFDAApprovals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching FDA approvals', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FDA approvals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fda/events
 * Get FDA adverse events
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    logger.info('FDA adverse events requested');
    
    res.json({
      success: true,
      data: mockFDAEvents,
      count: mockFDAEvents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching FDA events', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FDA events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fda/recalls
 * Get FDA device recalls
 */
router.get('/recalls', async (req: Request, res: Response) => {
  try {
    logger.info('FDA recalls requested');
    
    res.json({
      success: true,
      data: mockFDARecalls,
      count: mockFDARecalls.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching FDA recalls', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FDA recalls',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fda/all
 * Get all FDA data combined
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    logger.info('All FDA data requested');
    
    res.json({
      success: true,
      data: {
        approvals: mockFDAApprovals,
        events: mockFDAEvents,
        recalls: mockFDARecalls,
        summary: {
          totalApprovals: mockFDAApprovals.length,
          totalEvents: mockFDAEvents.length,
          totalRecalls: mockFDARecalls.length,
          lastUpdated: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching all FDA data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FDA data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/fda/stats
 * Get FDA statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    logger.info('FDA stats requested');
    
    // Calculate critical recalls (Class I)
    const criticalRecalls = mockFDARecalls.filter(recall => recall.classification === 'Class I').length;
    const activeRecalls = mockFDARecalls.filter(recall => recall.recall_status === 'Ongoing' || recall.status === 'Ongoing' || recall.status === 'Active').length;
    
    // Calculate compliance score (higher is better)
    // Base score: 100, reduce by recalls and events
    const complianceScore = Math.max(0, Math.min(100, 
      100 - (activeRecalls * 5) - (criticalRecalls * 10) - (mockFDAEvents.length * 2)
    ));
    
    res.json({
      success: true,
      data: {
        totalApprovals: mockFDAApprovals.length,
        activeRecalls: activeRecalls,
        criticalRecalls: criticalRecalls,
        adverseEvents: mockFDAEvents.length,
        complianceScore: complianceScore,
        lastUpdated: new Date().toISOString(),
        // Keep backward compatibility
        totalEvents: mockFDAEvents.length,
        totalRecalls: mockFDARecalls.length,
        recentApprovals: mockFDAApprovals.slice(0, 3),
        lastSync: new Date().toISOString(),
        status: 'active'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching FDA stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch FDA stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==========================================
// POST ROUTES (Sync operations)
// ==========================================

/**
 * POST /api/fda/sync-510k
 * Sync FDA 510(k) data
 */
router.post('/sync-510k', async (req: Request, res: Response) => {
  try {
    logger.info('FDA 510(k) sync initiated');
    
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'FDA 510(k) sync completed successfully',
      synced: 15,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error syncing FDA 510(k)', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to sync FDA 510(k) data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/fda/sync-recalls
 * Sync FDA recalls data
 */
router.post('/sync-recalls', async (req: Request, res: Response) => {
  try {
    logger.info('FDA recalls sync initiated');
    
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      message: 'FDA recalls sync completed successfully',
      synced: 8,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error syncing FDA recalls', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to sync FDA recalls',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/fda/sync-all
 * Sync all FDA data
 */
router.post('/sync-all', async (req: Request, res: Response) => {
  try {
    logger.info('Complete FDA sync initiated');
    
    // Simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      message: 'Complete FDA sync finished successfully',
      synced: {
        approvals: 15,
        events: 23,
        recalls: 8
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error syncing FDA data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: 'Failed to sync FDA data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

