import { addDays, differenceInDays, isAfter, isBefore, setYear, setMonth, setDate, startOfDay } from 'date-fns';
import { SeasonPeriod, SeasonType } from '../types';

/**
 * ÁGUAS: 15/12 to 15/05
 * SECA: 16/05 to 14/12
 */

export function getSeasonForDate(date: Date): SeasonType {
  const d = startOfDay(date);
  const year = d.getFullYear();

  const aguasEnd = startOfDay(new Date(year, 4, 15)); // May 15
  const aguasStartPrev = startOfDay(new Date(year - 1, 11, 15)); // Dec 15 prev year
  const aguasStartCurr = startOfDay(new Date(year, 11, 15)); // Dec 15 curr year

  if ((d >= aguasStartPrev && d <= aguasEnd) || d >= aguasStartCurr) {
    return SeasonType.AGUAS;
  }
  return SeasonType.SECA;
}

export function getNextSeasonBoundary(date: Date): Date {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const currentSeason = getSeasonForDate(d);

  if (currentSeason === SeasonType.AGUAS) {
    // If in ÁGUAS, next boundary is SECA start (May 16)
    const boundary = startOfDay(new Date(year, 4, 16));
    if (isAfter(d, boundary)) {
      // This case happens if we are in the Dec part of ÁGUAS
      return startOfDay(new Date(year + 1, 4, 16));
    }
    return boundary;
  } else {
    // If in SECA, next boundary is ÁGUAS start (Dec 15)
    const boundary = startOfDay(new Date(year, 11, 15));
    if (isAfter(d, boundary)) {
       // Should not happen with current logic but for safety
       return startOfDay(new Date(year + 1, 11, 15));
    }
    return boundary;
  }
}

export function generateSeasons(startDate: Date, totalDays: number): SeasonPeriod[] {
  const seasons: SeasonPeriod[] = [];
  let currentDate = startOfDay(startDate);
  let remainingDays = totalDays;

  while (remainingDays > 0) {
    const type = getSeasonForDate(currentDate);
    const nextBoundary = getNextSeasonBoundary(currentDate);
    
    // Days until next season change
    const daysInThisPeriod = differenceInDays(nextBoundary, currentDate);
    const actualDays = Math.min(daysInThisPeriod, remainingDays);
    
    const endDate = addDays(currentDate, actualDays - 1);

    seasons.push({
      id: `season-${seasons.length}-${type}`,
      type,
      startDate: currentDate,
      endDate,
      totalDays: actualDays,
      strategies: [],
    });

    currentDate = addDays(endDate, 1);
    remainingDays -= actualDays;
  }

  return seasons;
}

export function getNextSeason(lastSeason: SeasonPeriod): SeasonPeriod {
  const startDate = addDays(lastSeason.endDate, 1);
  const nextBoundary = getNextSeasonBoundary(startDate);
  const totalDays = differenceInDays(nextBoundary, startDate);
  
  return {
    id: `season-${Math.random().toString(36).substr(2, 9)}-${getSeasonForDate(startDate)}`,
    type: getSeasonForDate(startDate),
    startDate,
    endDate: addDays(startDate, totalDays - 1),
    totalDays,
    strategies: [],
  };
}

export function getFirstSeason(startDate: Date): SeasonPeriod {
  const nextBoundary = getNextSeasonBoundary(startDate);
  const totalDays = differenceInDays(nextBoundary, startDate);
  
  return {
    id: `season-first-${getSeasonForDate(startDate)}`,
    type: getSeasonForDate(startDate),
    startDate,
    endDate: addDays(startDate, totalDays - 1),
    totalDays,
    strategies: [],
  };
}
