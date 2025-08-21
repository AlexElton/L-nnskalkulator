import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { WorkDay, PayRates } from '../App';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface EmployeeInfo {
  name: string;
  id: string;
  department: string;
}

interface PDFGenerationOptions {
  workDays: WorkDay[];
  breakdown: any[];
  totalEarnings: number;
  basePay: number;
  payRates: PayRates;
  includePaySummary: boolean;
  employeeInfo: EmployeeInfo;
}

export const generateTimesheetPDF = async (options: PDFGenerationOptions) => {
  const {
    workDays,
    breakdown,
    totalEarnings,
    basePay,
    payRates,
    includePaySummary,
    employeeInfo
  } = options;

  const doc = new jsPDF();
  let yPosition = 20;

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    return `${dayNames[date.getDay()]}, ${date.toLocaleDateString('no-NO')}`;
  };

  const formatCurrency = (amount: number) => {
    return `NOK ${amount.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalHours = () => {
    return breakdown.reduce((total, day) => total + day.totalHours, 0);
  };

  const getDateRange = () => {
    if (workDays.length === 0) return '';
    
    const dates = workDays.map(day => new Date(day.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    const formatShortDate = (date: Date) => {
      return date.toLocaleDateString('no-NO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    if (startDate.getTime() === endDate.getTime()) {
      return formatShortDate(startDate);
    }
    
    return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TIMEARK', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Employee Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Navn: ${employeeInfo.name}`, 20, yPosition);
  doc.text(`Ansatt-ID: ${employeeInfo.id}`, 120, yPosition);
  yPosition += 8;
  doc.text(`Avdeling: ${employeeInfo.department}`, 20, yPosition);
  doc.text(`Periode: ${getDateRange()}`, 120, yPosition);
  yPosition += 15;

  // Summary box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPosition, 170, 25, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SAMMENDRAG', 25, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Totalt antall timer: ${getTotalHours().toFixed(1)}`, 25, yPosition + 16);
  doc.text(`Antall arbeidsdager: ${workDays.length}`, 25, yPosition + 22);
  
  if (includePaySummary) {
    doc.text(`Total inntekt: ${formatCurrency(totalEarnings)}`, 120, yPosition + 16);
    doc.text(`Grunnlønn: ${formatCurrency(basePay)}/time`, 120, yPosition + 22);
  }
  
  yPosition += 35;

  // Work days table
  const tableData = workDays
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(workDay => {
      const dayBreakdown = breakdown.find(b => b.date === workDay.date);
      const hours = dayBreakdown ? dayBreakdown.totalHours.toFixed(1) : '0.0';
      const earnings = dayBreakdown && includePaySummary ? formatCurrency(dayBreakdown.dailyEarnings) : '';
      
      return [
        formatDate(workDay.date),
        workDay.startTime,
        workDay.endTime,
        hours,
        ...(includePaySummary ? [earnings] : [])
      ];
    });

  const tableColumns = [
    'Dato',
    'Start',
    'Slutt',
    'Timer',
    ...(includePaySummary ? ['Inntekt'] : [])
  ];

  doc.autoTable({
    head: [tableColumns],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: includePaySummary ? 50 : 60 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      ...(includePaySummary ? { 4: { cellWidth: 35, halign: 'right' } } : {})
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Pay summary section
  if (includePaySummary && yPosition < 250) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LØNNSDETALJER', 20, yPosition);
    yPosition += 10;

    // Pay rates table
    const payRatesData = [
      ['Ukedag 07-15', `${payRates.weekdayDay.toFixed(2)}x`, formatCurrency(basePay * payRates.weekdayDay)],
      ['Ukedag 15-23', `${payRates.weekdayEvening.toFixed(2)}x`, formatCurrency(basePay * payRates.weekdayEvening)],
      ['Lørdag 07-15', `${payRates.saturdayDay.toFixed(2)}x`, formatCurrency(basePay * payRates.saturdayDay)],
      ['Lørdag 15-23', `${payRates.saturdayEvening.toFixed(2)}x`, formatCurrency(basePay * payRates.saturdayEvening)],
      ['Søndag 07-23', `${payRates.sunday.toFixed(2)}x`, formatCurrency(basePay * payRates.sunday)]
    ];

    doc.autoTable({
      head: [['Tidsperiode', 'Faktor', 'Timelønn']],
      body: payRatesData,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Total earnings
    if (yPosition < 270) {
      doc.setDrawColor(59, 130, 246);
      doc.setFillColor(239, 246, 255);
      doc.rect(20, yPosition, 170, 15, 'FD');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL INNTEKT: ${formatCurrency(totalEarnings)}`, 25, yPosition + 10);
    }
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generert: ${new Date().toLocaleDateString('no-NO')} ${new Date().toLocaleTimeString('no-NO')}`, 20, pageHeight - 10);
  doc.text('Lønn Kalkulator', 190, pageHeight - 10, { align: 'right' });

  // Save the PDF
  const fileName = `Timeark_${employeeInfo.name.replace(/\s+/g, '_')}_${getDateRange().replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};