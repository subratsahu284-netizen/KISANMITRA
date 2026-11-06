import { jsPDF } from 'jspdf';
import { ScanRecord } from '../types.ts';

export function generateDiagnosisPDF(scan: ScanRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner (Forest Green Gradient simulated)
  doc.setFillColor(14, 159, 92); // #0e9f5c
  doc.rect(0, 0, pageWidth, 28, 'F');

  // App Title & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('KisanMitra AI • Crop Risk Decision Support', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Official Plant Pathology & Agronomic Advisory Report', margin, 18);
  doc.text('In Collaboration with Krishi Vigyan Kendra (KVK) Extension Services', margin, 23);

  // Report Reference Metadata Bar
  doc.setFillColor(243, 250, 245);
  doc.rect(margin, 32, contentWidth, 18, 'F');
  doc.setDrawColor(211, 234, 219);
  doc.rect(margin, 32, contentWidth, 18, 'S');

  doc.setTextColor(18, 57, 42); // --ink
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORT ID: ${scan.id}`, margin + 4, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date(scan.createdAt).toLocaleString()}`, margin + 4, 45);

  doc.setFont('helvetica', 'bold');
  doc.text(`FARMER: ${scan.farmerName || 'Ramesh Patel'}`, margin + 95, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`LOCATION: ${scan.location || 'Sambalpur, Odisha'}`, margin + 95, 45);

  let currentY = 56;

  // Section 1: Crop & Field Context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 122, 69);
  doc.text('1. Crop & Growth Details', margin, currentY);
  currentY += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(30, 40, 35);
  doc.setFont('helvetica', 'bold');
  doc.text('Vegetable Crop:', margin + 4, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${scan.vegetable} (${scan.variety || 'Hybrid'})`, margin + 42, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Growth Stage:', margin + 100, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(scan.stage || 'Vegetative / Flowering', margin + 130, currentY);

  currentY += 10;

  // Section 2: Diagnosis Outcome Card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 122, 69);
  doc.text('2. Diagnostic Assessment', margin, currentY);
  currentY += 6;

  const isDeficiency = scan.problemType === 'deficiency';
  const isHealthy = scan.problemType === 'healthy';
  const headerBgColor = isHealthy ? [47, 191, 113] : isDeficiency ? [255, 197, 51] : [229, 72, 77];

  doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
  doc.rect(margin, currentY, contentWidth, 8, 'F');

  doc.setTextColor(isHealthy || !isDeficiency ? 255 : 30, isDeficiency ? 30 : 255, isDeficiency ? 0 : 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const typeLabel = isHealthy ? 'HEALTHY LEAF' : isDeficiency ? 'NUTRIENT DEFICIENCY DETECTED' : 'DISEASE / PATHOGEN DETECTED';
  doc.text(`${typeLabel} — ${scan.confidence}% CONFIDENCE MATCH`, margin + 4, currentY + 5.5);

  currentY += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(211, 234, 219);
  doc.rect(margin, currentY, contentWidth, 24, 'FD');

  doc.setTextColor(18, 57, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(scan.problemName, margin + 4, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Severity Level: ', margin + 4, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(isHealthy ? 14 : 180, isHealthy ? 140 : 40, 20);
  doc.text(scan.severity || 'Moderate', margin + 30, currentY + 14);

  doc.setTextColor(70, 90, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Symptoms: ', margin + 4, currentY + 20);
  doc.setFont('helvetica', 'normal');
  const splitSymptoms = doc.splitTextToSize(scan.symptoms, contentWidth - 30);
  doc.text(splitSymptoms, margin + 25, currentY + 20);

  currentY += 30;

  // Section 3: Actionable Remedies & Management Plan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 122, 69);
  doc.text('3. Recommended Advisory & Management Plan', margin, currentY);
  currentY += 6;

  scan.remedies.forEach((remedy, idx) => {
    // Check page overflow
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    const boxHeight = remedy.dosage ? 20 : 16;
    doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 253 : 255, idx % 2 === 0 ? 251 : 255);
    doc.setDrawColor(210, 230, 220);
    doc.rect(margin, currentY, contentWidth, boxHeight, 'FD');

    // Category Tag
    const tag = remedy.category.toUpperCase();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 159, 92);
    doc.text(`[${tag}]`, margin + 4, currentY + 5);

    // Title
    doc.setFontSize(10);
    doc.setTextColor(18, 57, 42);
    doc.text(remedy.title, margin + 32, currentY + 5);

    // Instructions
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 75, 68);
    const splitInstructions = doc.splitTextToSize(remedy.instructions, contentWidth - 10);
    doc.text(splitInstructions, margin + 4, currentY + 10);

    // Dosage if applicable
    if (remedy.dosage) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(166, 95, 0); // amber
      doc.text(`Recommended Dosage: ${remedy.dosage}`, margin + 4, currentY + 16);
    }

    currentY += boxHeight + 4;
  });

  // Section 4: Safe Spraying & Weather Guidance Note
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(255, 248, 230);
  doc.setDrawColor(255, 218, 130);
  doc.rect(margin, currentY, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 75, 0);
  doc.text('IMPORTANT SPRAY & WEATHER SAFETY ADVISORY:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 60, 10);
  const weatherNote = 'Check current relative humidity and rain forecast before applying any foliar chemical or bio-agent. Maintain minimum 4-6 hours dry window. Do not spray during peak midday heat (>33°C) or strong wind gusts (>15 km/h) to prevent drift.';
  const splitNote = doc.splitTextToSize(weatherNote, contentWidth - 8);
  doc.text(splitNote, margin + 4, currentY + 10);

  currentY += 24;

  // Footer / Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(120, 140, 130);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'Disclaimer: This report is generated by KisanMitra AI Decision Support System. Visual symptoms can overlap between fungal, bacterial, viral diseases, and soil nutrient stresses. Confirm with your district Krishi Vigyan Kendra (KVK) officer before purchasing commercial chemicals.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(splitDisclaimer, margin, pageHeight - 12);

  // Save / Download PDF
  const filename = `KisanMitra_Report_${scan.vegetable}_${scan.id.substring(0, 8)}.pdf`;
  doc.save(filename);
}
