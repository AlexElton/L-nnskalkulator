import React, { useState } from 'react';
import { ArrowLeft, Save, DollarSign, Clock, Plus, Edit2, Trash2, X } from 'lucide-react';
import { PayRate } from '../App';

interface SettingsProps {
  basePay: number;
  payRates: PayRate[];
  onBasePayChange: (basePay: number) => void;
  onPayRatesChange: (payRates: PayRate[]) => void;
  onBack: () => void;
}

interface PayRateFormData {
  name: string;
  description: string;
  multiplier: number;
  timeRanges: { startHour: number; endHour: number }[];
  daysOfWeek: number[];
  color: string;
}

const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
const colorOptions = [
  { value: 'blue', label: 'Blå', class: 'bg-blue-100 text-blue-800' },
  { value: 'green', label: 'Grønn', class: 'bg-green-100 text-green-800' },
  { value: 'orange', label: 'Oransje', class: 'bg-orange-100 text-orange-800' },
  { value: 'purple', label: 'Lilla', class: 'bg-purple-100 text-purple-800' },
  { value: 'red', label: 'Rød', class: 'bg-red-100 text-red-800' },
  { value: 'yellow', label: 'Gul', class: 'bg-yellow-100 text-yellow-800' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-800' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800' }
];

export const Settings: React.FC<SettingsProps> = ({
  basePay,
  payRates,
  onBasePayChange,
  onPayRatesChange,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'payrates'>('general');
  const [tempBasePay, setTempBasePay] = useState(basePay);
  const [tempPayRates, setTempPayRates] = useState(payRates);
  const [showPayRateForm, setShowPayRateForm] = useState(false);
  const [editingPayRate, setEditingPayRate] = useState<PayRate | null>(null);
  const [formData, setFormData] = useState<PayRateFormData>({
    name: '',
    description: '',
    multiplier: 1.0,
    timeRanges: [{ startHour: 7, endHour: 15 }],
    daysOfWeek: [],
    color: 'blue'
  });

  const handleSave = () => {
    onBasePayChange(tempBasePay);
    onPayRatesChange(tempPayRates);
    onBack();
  };

  const formatMultiplier = (multiplier: number) => {
    if (multiplier === 1.0) return 'Normal';
    return `+${Math.round((multiplier - 1) * 100)}%`;
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(c => c.value === color);
    return colorOption?.class || 'bg-blue-100 text-blue-800';
  };

  const openPayRateForm = (payRate?: PayRate) => {
    if (payRate) {
      setEditingPayRate(payRate);
      setFormData({
        name: payRate.name,
        description: payRate.description,
        multiplier: payRate.multiplier,
        timeRanges: [...payRate.timeRanges],
        daysOfWeek: [...payRate.daysOfWeek],
        color: payRate.color
      });
    } else {
      setEditingPayRate(null);
      setFormData({
        name: '',
        description: '',
        multiplier: 1.0,
        timeRanges: [{ startHour: 7, endHour: 15 }],
        daysOfWeek: [],
        color: 'blue'
      });
    }
    setShowPayRateForm(true);
  };

  const closePayRateForm = () => {
    setShowPayRateForm(false);
    setEditingPayRate(null);
  };

  const handlePayRateSubmit = () => {
    if (!formData.name.trim() || formData.daysOfWeek.length === 0 || formData.timeRanges.length === 0) {
      alert('Vennligst fyll ut alle obligatoriske felt');
      return;
    }

    const newPayRate: PayRate = {
      id: editingPayRate?.id || `custom-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      multiplier: formData.multiplier,
      timeRanges: formData.timeRanges,
      daysOfWeek: formData.daysOfWeek,
      color: formData.color
    };

    if (editingPayRate) {
      setTempPayRates(tempPayRates.map(rate => 
        rate.id === editingPayRate.id ? newPayRate : rate
      ));
    } else {
      setTempPayRates([...tempPayRates, newPayRate]);
    }

    closePayRateForm();
  };

  const deletePayRate = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne lønnsatsen?')) {
      setTempPayRates(tempPayRates.filter(rate => rate.id !== id));
    }
  };

  const addTimeRange = () => {
    setFormData({
      ...formData,
      timeRanges: [...formData.timeRanges, { startHour: 7, endHour: 15 }]
    });
  };

  const removeTimeRange = (index: number) => {
    setFormData({
      ...formData,
      timeRanges: formData.timeRanges.filter((_, i) => i !== index)
    });
  };

  const updateTimeRange = (index: number, field: 'startHour' | 'endHour', value: number) => {
    const newTimeRanges = [...formData.timeRanges];
    newTimeRanges[index] = { ...newTimeRanges[index], [field]: value };
    setFormData({ ...formData, timeRanges: newTimeRanges });
  };

  const toggleDayOfWeek = (day: number) => {
    const newDaysOfWeek = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day].sort();
    
    setFormData({ ...formData, daysOfWeek: newDaysOfWeek });
  };

  const formatTimeRanges = (timeRanges: { startHour: number; endHour: number }[]) => {
    return timeRanges.map(range => 
      `${range.startHour.toString().padStart(2, '0')}:00-${range.endHour.toString().padStart(2, '0')}:00`
    ).join(', ');
  };

  const formatDaysOfWeek = (daysOfWeek: number[]) => {
    return daysOfWeek.map(day => dayNames[day]).join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Innstillinger</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Generelt
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payrates')}
              className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === 'payrates'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Lønnsatser
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grunnlønn per time (NOK)
                  </label>
                  <input
                    type="number"
                    value={tempBasePay}
                    onChange={(e) => setTempBasePay(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Dette er din grunnlønn som brukes for alle beregninger
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'payrates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Lønnsatser</h3>
                  <button
                    onClick={() => openPayRateForm()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Legg til sats
                  </button>
                </div>

                <div className="grid gap-4">
                  {tempPayRates.map((rate) => (
                    <div key={rate.id} className={`p-4 rounded-lg border-2 ${getColorClass(rate.color)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-800">{rate.name}</span>
                            <span className="text-sm text-slate-600">{formatMultiplier(rate.multiplier)}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{rate.description}</p>
                          <div className="text-xs text-slate-500 space-y-1">
                            <div>Dager: {formatDaysOfWeek(rate.daysOfWeek)}</div>
                            <div>Tider: {formatTimeRanges(rate.timeRanges)}</div>
                            <div>Timelønn: NOK {(tempBasePay * rate.multiplier).toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openPayRateForm(rate)}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
                            title="Rediger"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => deletePayRate(rate.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Slett"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {tempPayRates.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Ingen lønnsatser konfigurert</p>
                    <p className="text-sm">Legg til din første lønnsats for å komme i gang</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-slate-200 p-6">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lagre Innstillinger
            </button>
          </div>
        </div>
      </div>

      {/* Pay Rate Form Modal */}
      {showPayRateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingPayRate ? 'Rediger Lønnsats' : 'Ny Lønnsats'}
              </h2>
              <button
                onClick={closePayRateForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Navn *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="f.eks. Kveldstillegg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Beskrivelse
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="f.eks. Tillegg for arbeid på kveldstid"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Multiplikator *
                    </label>
                    <input
                      type="number"
                      value={formData.multiplier}
                      onChange={(e) => setFormData({ ...formData, multiplier: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Timelønn: NOK {(tempBasePay * formData.multiplier).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Farge
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Ukedager *
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDayOfWeek(index)}
                      className={`p-2 text-sm rounded-lg border transition-colors duration-200 ${
                        formData.daysOfWeek.includes(index)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Ranges */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Tidsperioder *
                  </label>
                  <button
                    type="button"
                    onClick={addTimeRange}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Legg til periode
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.timeRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Fra time</label>
                          <input
                            type="number"
                            value={range.startHour}
                            onChange={(e) => updateTimeRange(index, 'startHour', Number(e.target.value))}
                            min="0"
                            max="23"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Til time</label>
                          <input
                            type="number"
                            value={range.endHour}
                            onChange={(e) => updateTimeRange(index, 'endHour', Number(e.target.value))}
                            min="0"
                            max="23"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {formData.timeRanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeRange(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className={`p-4 rounded-lg ${getColorClass(formData.color)}`}>
                <h4 className="font-medium mb-2">Forhåndsvisning</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Navn:</strong> {formData.name || 'Ikke angitt'}</div>
                  <div><strong>Beskrivelse:</strong> {formData.description || 'Ikke angitt'}</div>
                  <div><strong>Multiplikator:</strong> {formData.multiplier}x ({formatMultiplier(formData.multiplier)})</div>
                  <div><strong>Timelønn:</strong> NOK {(tempBasePay * formData.multiplier).toFixed(2)}</div>
                  <div><strong>Dager:</strong> {formatDaysOfWeek(formData.daysOfWeek) || 'Ingen valgt'}</div>
                  <div><strong>Tider:</strong> {formatTimeRanges(formData.timeRanges)}</div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={closePayRateForm}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Avbryt
              </button>
              <button
                onClick={handlePayRateSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                {editingPayRate ? 'Oppdater' : 'Legg til'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};