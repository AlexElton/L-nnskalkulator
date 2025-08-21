import React from 'react';
import { WorkDay } from '../App';
import { Calendar } from 'lucide-react';

interface WorkDayEntryProps {
  workDay: WorkDay;
  onTimeUpdate: (date: string, startTime: string, endTime: string) => void;
}

export const WorkDayEntry: React.FC<WorkDayEntryProps> = ({ workDay, onTimeUpdate }) => {
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const monthNames = [
      'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    return `${dayNames[date.getDay()]}, ${date.getDate()}. ${monthNames[date.getMonth()]}`;
  };

  const getDayType = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (dayOfWeek === 0) return 'sunday';
    if (dayOfWeek === 6) return 'saturday';
    return 'weekday';
  };

  const dayType = getDayType(workDay.date);
  
  const getBorderColor = () => {
    switch (dayType) {
      case 'sunday': return 'border-orange-200';
      case 'saturday': return 'border-green-200';
      default: return 'border-blue-200';
    }
  };

  const getBackgroundColor = () => {
    switch (dayType) {
      case 'sunday': return 'bg-orange-50';
      case 'saturday': return 'bg-green-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${getBorderColor()} ${getBackgroundColor()} transition-all duration-200`}>
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-slate-600" />
        <h4 className="font-semibold text-slate-800">{formatDateDisplay(workDay.date)}</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Starttid
          </label>
          <input
            type="time"
            value={workDay.startTime}
            onChange={(e) => onTimeUpdate(workDay.date, e.target.value, workDay.endTime)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sluttid
          </label>
          <input
            type="time"
            value={workDay.endTime}
            onChange={(e) => onTimeUpdate(workDay.date, workDay.startTime, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
};