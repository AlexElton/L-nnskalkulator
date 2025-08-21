import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { WorkDayEntry } from './components/WorkDayEntry';
import { EarningsDisplay } from './components/EarningsDisplay';
import { Settings } from './components/Settings';
import { PayRatesInfo } from './components/PayRatesInfo';
import { ExportModal } from './components/ExportModal';
import { calculateEarnings } from './utils/payCalculations';
import { Calculator, Clock, Settings as SettingsIcon, Info } from 'lucide-react';

export interface WorkDay {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PayRate {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  timeRanges: TimeRange[];
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  color: string;
}

export interface TimeRange {
  startHour: number;
  endHour: number;
}

// Legacy interface for backward compatibility
export interface PayRates {
  weekdayDay: number;
  weekdayEvening: number;
  saturdayDay: number;
  saturdayEvening: number;
  sunday: number;
}

function App() {
  const [selectedDays, setSelectedDays] = useState<WorkDay[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [earningsBreakdown, setEarningsBreakdown] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'calculator' | 'settings'>('calculator');
  const [showPayRates, setShowPayRates] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Settings state
  const [basePay, setBasePay] = useState(225);
  const [payRates, setPayRates] = useState<PayRate[]>([
    {
      id: 'weekday-day',
      name: 'Ukedag Dag',
      description: 'Mandag-Fredag 07:00-15:00',
      multiplier: 1.0,
      timeRanges: [{ startHour: 7, endHour: 15 }],
      daysOfWeek: [1, 2, 3, 4, 5],
      color: 'blue'
    },
    {
      id: 'weekday-evening',
      name: 'Ukedag Kveld',
      description: 'Mandag-Fredag 15:00-23:00',
      multiplier: 1.25,
      timeRanges: [{ startHour: 15, endHour: 23 }],
      daysOfWeek: [1, 2, 3, 4, 5],
      color: 'green'
    },
    {
      id: 'saturday-day',
      name: 'Lørdag Dag',
      description: 'Lørdag 07:00-15:00',
      multiplier: 1.25,
      timeRanges: [{ startHour: 7, endHour: 15 }],
      daysOfWeek: [6],
      color: 'green'
    },
    {
      id: 'saturday-evening',
      name: 'Lørdag Kveld',
      description: 'Lørdag 15:00-23:00',
      multiplier: 1.4,
      timeRanges: [{ startHour: 15, endHour: 23 }],
      daysOfWeek: [6],
      color: 'orange'
    },
    {
      id: 'sunday',
      name: 'Søndag',
      description: 'Søndag 07:00-23:00',
      multiplier: 1.4,
      timeRanges: [{ startHour: 7, endHour: 23 }],
      daysOfWeek: [0],
      color: 'orange'
    }
  ]);

  // Convert new PayRate[] to legacy PayRates for backward compatibility
  const getLegacyPayRates = (): PayRates => {
    const findRate = (id: string) => payRates.find(rate => rate.id === id)?.multiplier || 1.0;
    
    return {
      weekdayDay: findRate('weekday-day'),
      weekdayEvening: findRate('weekday-evening'),
      saturdayDay: findRate('saturday-day'),
      saturdayEvening: findRate('saturday-evening'),
      sunday: findRate('sunday')
    };
  };

  useEffect(() => {
    const { total, breakdown } = calculateEarnings(selectedDays, basePay, getLegacyPayRates());
    setTotalEarnings(total);
    setEarningsBreakdown(breakdown);
  }, [selectedDays, basePay, payRates]);

  const handleDaySelect = (date: string) => {
    const existing = selectedDays.find(day => day.date === date);
    if (existing) {
      setSelectedDays(selectedDays.filter(day => day.date !== date));
    } else {
      // Add new days to the beginning of the array
      setSelectedDays([{ date, startTime: '07:00', endTime: '15:00' }, ...selectedDays]);
    }
  };

  const handleTimeUpdate = (date: string, startTime: string, endTime: string) => {
    setSelectedDays(selectedDays.map(day => 
      day.date === date ? { ...day, startTime, endTime } : day
    ));
  };

  const clearAll = () => {
    setSelectedDays([]);
  };

  if (currentView === 'settings') {
    return (
      <Settings
        basePay={basePay}
        payRates={payRates}
        onBasePayChange={setBasePay}
        onPayRatesChange={setPayRates}
        onBack={() => setCurrentView('calculator')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Lønn Kalkulator</h1>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setShowPayRates(true)}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors duration-200"
                title="Vis lønnsatser"
              >
                <Info className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors duration-200"
                title="Innstillinger"
              >
                <SettingsIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Beregn din lønn basert på arbeidsdager og timer. Grunnlønn: <span className="font-semibold text-blue-600">NOK {basePay},-/time</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-800">Velg Arbeidsdager</h2>
              </div>
              <Calendar 
                selectedDays={selectedDays.map(day => day.date)}
                onDaySelect={handleDaySelect}
              />
              
              {selectedDays.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">Arbeidstider</h3>
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                    >
                      Fjern alle
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {selectedDays.map(day => (
                      <WorkDayEntry
                        key={day.date}
                        workDay={day}
                        onTimeUpdate={handleTimeUpdate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Section */}
          <div className="lg:col-span-1">
            <EarningsDisplay 
              totalEarnings={totalEarnings}
              breakdown={earningsBreakdown}
              selectedDaysCount={selectedDays.length}
              onExport={() => setShowExportModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Pay Rates Modal */}
      {showPayRates && (
        <PayRatesInfo
          basePay={basePay}
          payRates={getLegacyPayRates()}
          onClose={() => setShowPayRates(false)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          workDays={selectedDays}
          totalEarnings={totalEarnings}
          breakdown={earningsBreakdown}
          basePay={basePay}
          payRates={getLegacyPayRates()}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;