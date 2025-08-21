import React from 'react';
import { X } from 'lucide-react';
import { PayRates } from '../App';

interface PayRatesInfoProps {
  basePay: number;
  payRates: PayRates;
  onClose: () => void;
}

export const PayRatesInfo: React.FC<PayRatesInfoProps> = ({ basePay, payRates, onClose }) => {
  const formatCurrency = (amount: number) => {
    return `NOK ${amount.toFixed(2)}`;
  };

  const formatMultiplier = (multiplier: number) => {
    if (multiplier === 1.0) return 'Normallønn';
    return `+${Math.round((multiplier - 1) * 100)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Lønnsatser</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-blue-800">Man-Fre 07-15</div>
                <div className="text-blue-600">{formatMultiplier(payRates.weekdayDay)}</div>
              </div>
              <div className="text-blue-600">{formatCurrency(basePay * payRates.weekdayDay)}</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-800">Man-Fre 15-23</div>
                <div className="text-green-600">{formatMultiplier(payRates.weekdayEvening)}</div>
              </div>
              <div className="text-green-600">{formatCurrency(basePay * payRates.weekdayEvening)}</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-800">Lør 07-15</div>
                <div className="text-green-600">{formatMultiplier(payRates.saturdayDay)}</div>
              </div>
              <div className="text-green-600">{formatCurrency(basePay * payRates.saturdayDay)}</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-orange-800">Lør 15-23</div>
                <div className="text-orange-600">{formatMultiplier(payRates.saturdayEvening)}</div>
              </div>
              <div className="text-orange-600">{formatCurrency(basePay * payRates.saturdayEvening)}</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-orange-800">Søn 07-23</div>
                <div className="text-orange-600">{formatMultiplier(payRates.sunday)}</div>
              </div>
              <div className="text-orange-600">{formatCurrency(basePay * payRates.sunday)}</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Grunnlønn:</strong> {formatCurrency(basePay)} per time
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Alle satser beregnes basert på grunnlønnen multiplisert med tillegget for den aktuelle tidsperioden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};