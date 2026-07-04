import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface RegulatoryReportData {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdDate: string;
    lastModified: string;
    tenantId: string;
  };
  fdaApproval?: {
    product_name: string;
    device_name: string;
    manufacturer_name: string;
    device_class: string;
    submission_type: string;
    submission_number: string;
    submission_status: string;
    submission_date: string;
    decision_date: string;
    decision_code: string;
    decision_description: string;
  };
  fdaRecalls: Array<{
    recall_number: string;
    recall_date: string;
    recall_status: string;
    product_description: string;
    reason_for_recall: string;
    classification: string;
    distribution_pattern: string;
    manufacturer_name: string;
    product_quantity: string;
  }>;
  fdaEvents: Array<{
    event_type: string;
    report_number: string;
    manufacturer_name: string;
    device_name: string;
    event_date: string;
    event_description: string;
    patient_age: string;
    patient_sex: string;
    adverse_event_flag: string;
  }>;
}

export class PDFExportService {
  static async generateRegulatoryReport(data: RegulatoryReportData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Regulatory Intelligence Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Project Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Project: ${data.project.title}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Description: ${data.project.description}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Status: ${data.project.status}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Priority: ${data.project.priority}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Created: ${new Date(data.project.createdDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Last Modified: ${new Date(data.project.lastModified).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // FDA Approval Status
    if (data.fdaApproval) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FDA Regulatory Status', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Product: ${data.fdaApproval.product_name}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Device: ${data.fdaApproval.device_name}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Manufacturer: ${data.fdaApproval.manufacturer_name}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Device Class: ${data.fdaApproval.device_class}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Submission Type: ${data.fdaApproval.submission_type}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Submission Number: ${data.fdaApproval.submission_number}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Status: ${data.fdaApproval.submission_status}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Decision Date: ${data.fdaApproval.decision_date}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Decision: ${data.fdaApproval.decision_description}`, 20, yPosition);
      yPosition += 15;
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FDA Regulatory Status', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No FDA approval found for this project.', 20, yPosition);
      yPosition += 15;
    }

    // FDA Recalls
    if (data.fdaRecalls.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FDA Recalls & Safety Alerts', 20, yPosition);
      yPosition += 10;

      data.fdaRecalls.forEach((recall, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Recall ${index + 1}: ${recall.recall_number}`, 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Product: ${recall.product_description}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Manufacturer: ${recall.manufacturer_name}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Classification: ${recall.classification}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Status: ${recall.recall_status}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Date: ${recall.recall_date}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Reason: ${recall.reason_for_recall}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Quantity: ${recall.product_quantity}`, 20, yPosition);
        yPosition += 10;
      });
    }

    // FDA Events
    if (data.fdaEvents.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Related FDA Events', 20, yPosition);
      yPosition += 10;

      data.fdaEvents.slice(0, 3).forEach((event, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Event ${index + 1}: ${event.event_type}`, 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.text(`Device: ${event.device_name}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Report: ${event.report_number}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Date: ${event.event_date}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Patient: ${event.patient_age}yo ${event.patient_sex}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Description: ${event.event_description}`, 20, yPosition);
        yPosition += 10;
      });
    }

    // Compliance Summary
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const hasApproval = data.fdaApproval ? 'Yes' : 'No';
    const activeRecalls = data.fdaRecalls.filter(r => r.recall_status === 'Ongoing').length;
    const criticalRecalls = data.fdaRecalls.filter(r => r.classification === 'Class I').length;
    const adverseEvents = data.fdaEvents.filter(e => e.adverse_event_flag === 'Y').length;

    doc.text(`FDA Approval: ${hasApproval}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Active Recalls: ${activeRecalls}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Critical Recalls (Class I): ${criticalRecalls}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Adverse Events: ${adverseEvents}`, 20, yPosition);
    yPosition += 8;

    // Risk Assessment
    let riskLevel = 'Low';
    if (criticalRecalls > 0) riskLevel = 'High';
    else if (activeRecalls > 0 || adverseEvents > 2) riskLevel = 'Medium';

    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Risk Level: ${riskLevel}`, 20, yPosition);
    yPosition += 8;

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by Helix Regulatory Intelligence Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const fileName = `regulatory-report-${data.project.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  static async generateComplianceSummary(projects: any[]): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Summary Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary Statistics
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Projects: ${projects.length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Active Projects: ${projects.filter(p => p.status === 'active').length}`, 20, yPosition);
    yPosition += 8;
    doc.text(`High Priority: ${projects.filter(p => p.priority === 'high').length}`, 20, yPosition);
    yPosition += 15;

    // Project List
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Overview', 20, yPosition);
    yPosition += 10;

    projects.forEach((project, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${project.title}`, 20, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${project.status}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Priority: ${project.priority}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Created: ${new Date(project.createdDate).toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
    });

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by Helix Regulatory Intelligence Platform', pageWidth / 2, 280, { align: 'center' });

    // Save the PDF
    const fileName = `compliance-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
