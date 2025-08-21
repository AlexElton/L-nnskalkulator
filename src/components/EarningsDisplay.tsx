import React from 'react';
import { TrendingUp, Clock, DollarSign, Calendar, Download } from 'lucide-react';

interface EarningsDisplayProps {
  totalEarnings: number;
  breakdown: any[];
  selectedDaysCount: number;
  onExport: () => void;
}

export const EarningsDisplay: React.FC<EarningsDisplayProps> = ({ 
  totalEarnings, 
  breakdown, 
  selectedDaysCount,
  onExport
}) => {
  const formatCurrency = (amount: number) => {
    return `NOK ${amount.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTotalHours = () => {
    return breakdown.reduce((total, day) => total + day.totalHours, 0);
  };

  return (
    <div className="space-y-6">
      {/* Total Earnings Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold">Total Inntekt</h3>
        </div>
        <div className="text-3xl font-bold mb-2">
          {formatCurrency(totalEarnings)}
        </div>
        <div className="text-blue-100 text-sm">
          {selectedDaysCount} arbeidsdager • {getTotalHours().toFixed(1)} timer
        </div>
      </div>

      {/* Export Button */}
      {selectedDaysCount > 0 && (
        <button
          onClick={onExport}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Download className="w-5 h-5" />
          Eksporter Timeark
        </button>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-600">Timer</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {getTotalHours().toFixed(1)}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-600">Per time</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {getTotalHours() > 0 ? (totalEarnings / getTotalHours()).toFixed(0) : '0'}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Detaljert Oversikt</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {breakdown.map((day, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                <div>
                  <div className="font-medium text-slate-800">
                    {new Date(day.date).toLocaleDateString('no-NO', { 
                      weekday: 'short', 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="text-sm text-slate-600">
                    {day.totalHours.toFixed(1)} timer
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">
                    {formatCurrency(day.dailyEarnings)}
                  </div>
                  {day.segments.length > 1 && (
                    <div className="text-xs text-slate-500">
                      {day.segments.length} satser
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDaysCount === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-800 mb-2">Ingen dager valgt</h4>
          <p className="text-slate-600">Velg arbeidsdager i kalenderen for å se din inntekt</p>
        </div>
      )}
    </div>
  );
};