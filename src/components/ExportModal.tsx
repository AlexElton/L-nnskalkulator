import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Clock } from 'lucide-react';
import { WorkDay, PayRates } from '../App';
import { generateTimesheetPDF } from '../utils/pdfGenerator';

interface ExportModalProps {
  workDays: WorkDay[];
  totalEarnings: number;
  breakdown: any[];
  basePay: number;
  payRates: PayRates;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  workDays,
  totalEarnings,
  breakdown,
  basePay,
  payRates,
  onClose
}) => {
  const [includePaySummary, setIncludePaySummary] = useState(true);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (workDays.length === 0) {
      alert('Ingen arbeidsdager å eksportere');
      return;
    }

    setIsGenerating(true);
    try {
      await generateTimesheetPDF({
        workDays,
        breakdown,
        totalEarnings,
        basePay,
        payRates,
        includePaySummary,
        employeeInfo: {
          name: employeeName || 'Ikke oppgitt',
          id: employeeId || 'Ikke oppgitt',
          department: department || 'Ikke oppgitt'
        }
      });
    } catch (error) {
      console.error('Feil ved generering av PDF:', error);
      alert('Det oppstod en feil ved generering av PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTotalHours = () => {
    return breakdown.reduce((total, day) => total + day.totalHours, 0);
  };

  const getDateRange = () => {
    if (workDays.length === 0) return '';
    
    const dates = workDays.map(day => new Date(day.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('no-NO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    if (startDate.getTime() === endDate.getTime()) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Eksporter Timeark</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Oversikt</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600">Periode:</span>
                <span className="font-medium">{getDateRange()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-slate-600">Timer:</span>
                <span className="font-medium">{getTotalHours().toFixed(1)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600">Arbeidsdager:</span>
                <span className="font-medium ml-2">{workDays.length}</span>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Ansattinformasjon</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Navn
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Skriv inn navn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ansatt-ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="ID nummer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Avdeling
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Avdeling"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Eksportinnstillinger</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePaySummary}
                  onChange={(e) => setIncludePaySummary(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-slate-800">Inkluder lønnsdetaljer</span>
                  <p className="text-sm text-slate-600">Vis detaljert oversikt over lønnsberegning og satser</p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-2">Forhåndsvisning</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Timeark med alle valgte arbeidsdager</p>
              <p>• Start- og sluttider for hver dag</p>
              <p>• Total antall timer</p>
              {includePaySummary && (
                <>
                  <p>• Detaljert lønnsberegning</p>
                  <p>• Oversikt over tillegg og satser</p>
                  <p>• Total inntekt: NOK {totalEarnings.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="border-t border-slate-200 p-6">
          <button
            onClick={handleExport}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Genererer PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Last ned Timeark (PDF)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};