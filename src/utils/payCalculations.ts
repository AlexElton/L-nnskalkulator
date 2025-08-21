import { WorkDay, PayRates } from '../App';

interface PayRate {
  multiplier: number;
  description: string;
}

interface TimeSegment {
  startHour: number;
  endHour: number;
  hours: number;
  rate: PayRate;
  earnings: number;
}

interface DayBreakdown {
  date: string;
  segments: TimeSegment[];
  totalHours: number;
  dailyEarnings: number;
}

// Get pay rate based on day of week and time
const getPayRate = (dayOfWeek: number, hour: number, payRates: PayRates): PayRate => {
  // Sunday
  if (dayOfWeek === 0) {
    return { multiplier: payRates.sunday, description: 'Søndag' };
  }
  
  // Saturday
  if (dayOfWeek === 6) {
    if (hour >= 7 && hour < 15) {
      return { multiplier: payRates.saturdayDay, description: 'Lørdag dag' };
    } else if (hour >= 15 && hour < 23) {
      return { multiplier: payRates.saturdayEvening, description: 'Lørdag kveld' };
    }
  }
  
  // Monday - Friday
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    if (hour >= 7 && hour < 15) {
      return { multiplier: payRates.weekdayDay, description: 'Ukedag dag' };
    } else if (hour >= 15 && hour < 23) {
      return { multiplier: payRates.weekdayEvening, description: 'Ukedag kveld' };
    }
  }
  
  // Default rate for any other time (shouldn't happen with normal work hours)
  return { multiplier: payRates.weekdayDay, description: 'Normal' };
};

// Convert time string to decimal hours
const timeToDecimal = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

// Calculate earnings for a single work day
const calculateDayEarnings = (workDay: WorkDay, basePay: number, payRates: PayRates): DayBreakdown => {
  const date = new Date(workDay.date);
  const dayOfWeek = date.getDay();
  
  const startTime = timeToDecimal(workDay.startTime);
  const endTime = timeToDecimal(workDay.endTime);
  
  if (endTime <= startTime) {
    return {
      date: workDay.date,
      segments: [],
      totalHours: 0,
      dailyEarnings: 0
    };
  }
  
  const segments: TimeSegment[] = [];
  let currentTime = startTime;
  
  // Split work period into segments based on pay rate changes
  while (currentTime < endTime) {
    const currentHour = Math.floor(currentTime);
    const currentRate = getPayRate(dayOfWeek, currentHour, payRates);
    
    // Find the end of this rate period
    let segmentEnd = endTime;
    
    // Check for rate changes at specific hours
    const rateChangeHours = [7, 15, 23];
    for (const changeHour of rateChangeHours) {
      if (changeHour > currentTime && changeHour < endTime) {
        segmentEnd = Math.min(segmentEnd, changeHour);
      }
    }
    
    const segmentHours = segmentEnd - currentTime;
    const segmentEarnings = segmentHours * basePay * currentRate.multiplier;
    
    segments.push({
      startHour: currentTime,
      endHour: segmentEnd,
      hours: segmentHours,
      rate: currentRate,
      earnings: segmentEarnings
    });
    
    currentTime = segmentEnd;
  }
  
  const totalHours = segments.reduce((sum, segment) => sum + segment.hours, 0);
  const dailyEarnings = segments.reduce((sum, segment) => sum + segment.earnings, 0);
  
  return {
    date: workDay.date,
    segments,
    totalHours,
    dailyEarnings
  };
};

// Calculate total earnings for all work days
export const calculateEarnings = (workDays: WorkDay[], basePay: number = 225, payRates: PayRates) => {
  const breakdown = workDays.map(workDay => calculateDayEarnings(workDay, basePay, payRates));
  const total = breakdown.reduce((sum, day) => sum + day.dailyEarnings, 0);
  
  return {
    total,
    breakdown
  };
};

// Get formatted time range string
export const formatTimeRange = (start: number, end: number): string => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
};