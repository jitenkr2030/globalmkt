export interface Holiday {
  id: string;
  name: string;
  date: string;
  market: string;
  type: 'public' | 'bank' | 'exchange';
  impact: 'full' | 'partial' | 'early-close';
  description: string;
  recurring: boolean;
  regions: string[];
  affectedMarkets: string[];
}

export interface MarketHolidaySchedule {
  market: string;
  year: number;
  holidays: Holiday[];
  totalHolidays: number;
  tradingDays: number;
  specialSessions: SpecialSession[];
}

export interface SpecialSession {
  id: string;
  date: string;
  market: string;
  sessionType: 'early-close' | 'late-open' | 'special-trading';
  adjustedHours: {
    open: string;
    close: string;
    breakStart?: string;
    breakEnd?: string;
  };
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface HolidayCalendarQuery {
  market?: string;
  startDate?: string;
  endDate?: string;
  type?: Holiday['type'];
  impact?: Holiday['impact'];
  recurring?: boolean;
}

export interface TradingDayInfo {
  date: string;
  market: string;
  isTradingDay: boolean;
  isHoliday: boolean;
  holiday?: Holiday;
  isEarlyClose: boolean;
  specialSession?: SpecialSession;
  nextTradingDay?: string;
  previousTradingDay?: string;
}

export interface MarketHolidayStats {
  market: string;
  year: number;
  totalHolidays: number;
  publicHolidays: number;
  bankHolidays: number;
  exchangeHolidays: number;
  fullDayHolidays: number;
  partialDayHolidays: number;
  earlyCloseDays: number;
  mostCommonHolidayMonth: string;
  longestHolidayPeriod: {
    startDate: string;
    endDate: string;
    duration: number;
    holidays: Holiday[];
  };
}

class EuropeanHolidayCalendar {
  private readonly holidays: Map<string, Holiday[]> = new Map();
  private readonly specialSessions: Map<string, SpecialSession[]> = new Map();
  private readonly marketTimezones: Map<string, string> = new Map();

  constructor() {
    this.initializeMarketTimezones();
    this.initializeHolidays();
    this.initializeSpecialSessions();
  }

  private initializeMarketTimezones(): void {
    const timezones = [
      { market: 'london', timezone: 'GMT' },
      { market: 'euronext', timezone: 'CET' },
      { market: 'xetra', timezone: 'CET' },
      { market: 'six', timezone: 'CET' },
      { market: 'bme', timezone: 'CET' },
      { market: 'nasdaq-nordic', timezone: 'CET' },
      { market: 'oslo', timezone: 'CET' }
    ];

    timezones.forEach(({ market, timezone }) => {
      this.marketTimezones.set(market, timezone);
    });
  }

  private initializeHolidays(): void {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    years.forEach(year => {
      this.holidays.set(year.toString(), this.generateHolidaysForYear(year));
    });
  }

  private generateHolidaysForYear(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // Common European holidays
    const commonHolidays = this.getCommonEuropeanHolidays(year);
    holidays.push(...commonHolidays);

    // Market-specific holidays
    const marketSpecificHolidays = this.getMarketSpecificHolidays(year);
    holidays.push(...marketSpecificHolidays);

    // Country-specific holidays
    const countrySpecificHolidays = this.getCountrySpecificHolidays(year);
    holidays.push(...countrySpecificHolidays);

    return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private getCommonEuropeanHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - All markets closed",
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    // Good Friday (calculation based on Easter)
    const goodFriday = this.calculateGoodFriday(year);
    holidays.push({
      id: `good-friday-${year}`,
      name: 'Good Friday',
      date: goodFriday,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: 'Good Friday - All markets closed',
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    // Easter Monday
    const easterMonday = this.calculateEasterMonday(year);
    holidays.push({
      id: `easter-monday-${year}`,
      name: 'Easter Monday',
      date: easterMonday,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: 'Easter Monday - Most markets closed',
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    // Labor Day / May Day
    holidays.push({
      id: `labor-day-${year}`,
      name: 'Labor Day / May Day',
      date: `${year}-05-01`,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - Most European markets closed',
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    // Christmas Day
    holidays.push({
      id: `christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - All markets closed',
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    // Boxing Day
    holidays.push({
      id: `boxing-day-${year}`,
      name: 'Boxing Day',
      date: `${year}-12-26`,
      market: 'all',
      type: 'public',
      impact: 'full',
      description: 'Boxing Day - Most markets closed',
      recurring: true,
      regions: ['Europe'],
      affectedMarkets: ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    return holidays;
  }

  private getMarketSpecificHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // UK-specific holidays
    holidays.push({
      id: `early-may-bank-${year}`,
      name: 'Early May Bank Holiday',
      date: this.calculateFirstMondayInMonth(year, 5),
      market: 'london',
      type: 'bank',
      impact: 'full',
      description: 'Early May Bank Holiday - LSE closed',
      recurring: true,
      regions: ['UK'],
      affectedMarkets: ['london']
    });

    holidays.push({
      id: `spring-bank-${year}`,
      name: 'Spring Bank Holiday',
      date: this.calculateLastMondayInMonth(year, 5),
      market: 'london',
      type: 'bank',
      impact: 'full',
      description: 'Spring Bank Holiday - LSE closed',
      recurring: true,
      regions: ['UK'],
      affectedMarkets: ['london']
    });

    holidays.push({
      id: `summer-bank-${year}`,
      name: 'Summer Bank Holiday',
      date: this.calculateLastMondayInMonth(year, 8),
      market: 'london',
      type: 'bank',
      impact: 'full',
      description: 'Summer Bank Holiday - LSE closed',
      recurring: true,
      regions: ['UK'],
      affectedMarkets: ['london']
    });

    // German-specific holidays
    holidays.push({
      id: `german-unity-${year}`,
      name: 'German Unity Day',
      date: `${year}-10-03`,
      market: 'xetra',
      type: 'public',
      impact: 'full',
      description: 'German Unity Day - Xetra closed',
      recurring: true,
      regions: ['Germany'],
      affectedMarkets: ['xetra']
    });

    // Swiss-specific holidays
    holidays.push({
      id: `swiss-national-${year}`,
      name: 'Swiss National Day',
      date: `${year}-08-01`,
      market: 'six',
      type: 'public',
      impact: 'full',
      description: 'Swiss National Day - SIX closed',
      recurring: true,
      regions: ['Switzerland'],
      affectedMarkets: ['six']
    });

    // Spanish-specific holidays
    holidays.push({
      id: `spanish-national-${year}`,
      name: 'Spanish National Day',
      date: `${year}-10-12`,
      market: 'bme',
      type: 'public',
      impact: 'full',
      description: 'Spanish National Day - BME closed',
      recurring: true,
      regions: ['Spain'],
      affectedMarkets: ['bme']
    });

    // Nordic-specific holidays
    holidays.push({
      id: `norwegian-constitution-${year}`,
      name: 'Norwegian Constitution Day',
      date: `${year}-05-17`,
      market: 'oslo',
      type: 'public',
      impact: 'full',
      description: 'Norwegian Constitution Day - Oslo Børs closed',
      recurring: true,
      regions: ['Norway'],
      affectedMarkets: ['oslo']
    });

    holidays.push({
      id: `swedish-national-${year}`,
      name: 'Swedish National Day',
      date: `${year}-06-06`,
      market: 'nasdaq-nordic',
      type: 'public',
      impact: 'full',
      description: 'Swedish National Day - Nasdaq Nordic closed',
      recurring: true,
      regions: ['Sweden'],
      affectedMarkets: ['nasdaq-nordic']
    });

    return holidays;
  }

  private getCountrySpecificHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // Additional regional holidays
    holidays.push({
      id: `ascension-${year}`,
      name: 'Ascension Day',
      date: this.calculateAscensionDay(year),
      market: 'euronext,xetra,six,bme,nasdaq-nordic,oslo',
      type: 'public',
      impact: 'full',
      description: 'Ascension Day - Most continental European markets closed',
      recurring: true,
      regions: ['Continental Europe'],
      affectedMarkets: ['euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    holidays.push({
      id: `whit-monday-${year}`,
      name: 'Whit Monday',
      date: this.calculateWhitMonday(year),
      market: 'euronext,xetra,six,bme,nasdaq-nordic,oslo',
      type: 'public',
      impact: 'full',
      description: 'Whit Monday - Most continental European markets closed',
      recurring: true,
      regions: ['Continental Europe'],
      affectedMarkets: ['euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo']
    });

    return holidays;
  }

  private initializeSpecialSessions(): void {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    years.forEach(year => {
      this.specialSessions.set(year.toString(), this.generateSpecialSessionsForYear(year));
    });
  }

  private generateSpecialSessionsForYear(year: number): SpecialSession[] {
    const sessions: SpecialSession[] = [];

    // Christmas Eve early closes
    sessions.push({
      id: `christmas-eve-early-close-${year}`,
      date: `${year}-12-24`,
      market: 'all',
      sessionType: 'early-close',
      adjustedHours: {
        open: '08:00',
        close: '12:30'
      },
      reason: 'Christmas Eve - Early close',
      impact: 'high'
    });

    // New Year's Eve early closes
    sessions.push({
      id: `new-years-eve-early-close-${year}`,
      date: `${year}-12-31`,
      market: 'all',
      sessionType: 'early-close',
      adjustedHours: {
        open: '08:00',
        close: '12:30'
      },
      reason: 'New Year\'s Eve - Early close',
      impact: 'high'
    });

    return sessions;
  }

  // Easter calculation methods
  private calculateGoodFriday(year: number): string {
    const easter = this.calculateEaster(year);
    const goodFriday = new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000);
    return this.formatDate(goodFriday);
  }

  private calculateEasterMonday(year: number): string {
    const easter = this.calculateEaster(year);
    const easterMonday = new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000);
    return this.formatDate(easterMonday);
  }

  private calculateAscensionDay(year: number): string {
    const easter = this.calculateEaster(year);
    const ascension = new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000);
    return this.formatDate(ascension);
  }

  private calculateWhitMonday(year: number): string {
    const easter = this.calculateEaster(year);
    const whitMonday = new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000);
    return this.formatDate(whitMonday);
  }

  private calculateEaster(year: number): Date {
    // Anonymous Gregorian algorithm for Easter calculation
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month - 1, day);
  }

  // Helper methods for date calculations
  private calculateFirstMondayInMonth(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
    const firstMonday = new Date(year, month - 1, 1 + daysUntilMonday);
    return this.formatDate(firstMonday);
  }

  private calculateLastMondayInMonth(year: number, month: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    const lastDate = new Date(year, month - 1, lastDay);
    const dayOfWeek = lastDate.getDay();
    const daysFromMonday = (dayOfWeek - 1 + 7) % 7;
    const lastMonday = new Date(year, month - 1, lastDay - daysFromMonday);
    return this.formatDate(lastMonday);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Public API methods
  getHolidays(query: HolidayCalendarQuery = {}): Holiday[] {
    const {
      market,
      startDate,
      endDate,
      type,
      impact,
      recurring
    } = query;

    let allHolidays: Holiday[] = [];
    
    // Get holidays for relevant years
    const years = new Set<string>();
    if (startDate) {
      const startYear = new Date(startDate).getFullYear().toString();
      years.add(startYear);
    }
    if (endDate) {
      const endYear = new Date(endDate).getFullYear().toString();
      years.add(endYear);
    }
    if (years.size === 0) {
      const currentYear = new Date().getFullYear().toString();
      years.add(currentYear);
    }

    years.forEach(year => {
      const yearHolidays = this.holidays.get(year) || [];
      allHolidays.push(...yearHolidays);
    });

    // Filter holidays based on query parameters
    let filteredHolidays = allHolidays;

    if (market) {
      filteredHolidays = filteredHolidays.filter(holiday => 
        holiday.market === 'all' || holiday.market.includes(market) || holiday.affectedMarkets.includes(market)
      );
    }

    if (startDate) {
      filteredHolidays = filteredHolidays.filter(holiday => holiday.date >= startDate);
    }

    if (endDate) {
      filteredHolidays = filteredHolidays.filter(holiday => holiday.date <= endDate);
    }

    if (type) {
      filteredHolidays = filteredHolidays.filter(holiday => holiday.type === type);
    }

    if (impact) {
      filteredHolidays = filteredHolidays.filter(holiday => holiday.impact === impact);
    }

    if (recurring !== undefined) {
      filteredHolidays = filteredHolidays.filter(holiday => holiday.recurring === recurring);
    }

    return filteredHolidays;
  }

  getTradingDayInfo(date: string, market: string): TradingDayInfo {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString();
    
    const yearHolidays = this.holidays.get(year) || [];
    const yearSpecialSessions = this.specialSessions.get(year) || [];
    
    const holiday = yearHolidays.find(h => 
      h.date === date && (h.market === 'all' || h.market.includes(market) || h.affectedMarkets.includes(market))
    );
    
    const specialSession = yearSpecialSessions.find(s => 
      s.date === date && (s.market === 'all' || s.market.includes(market))
    );

    const isHoliday = !!holiday;
    const isTradingDay = !isHoliday && dateObj.getDay() !== 0 && dateObj.getDay() !== 6;
    const isEarlyClose = !!specialSession && specialSession.sessionType === 'early-close';

    // Calculate next and previous trading days using a simple check method
    const nextTradingDay = this.findNextTradingDaySimple(date, market);
    const previousTradingDay = this.findPreviousTradingDaySimple(date, market);

    return {
      date,
      market,
      isTradingDay,
      isHoliday,
      holiday,
      isEarlyClose,
      specialSession,
      nextTradingDay,
      previousTradingDay
    };
  }

  // Simple method to check if a date is a trading day without recursion
  private isTradingDaySimple(date: string, market: string): boolean {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString();
    
    const yearHolidays = this.holidays.get(year) || [];
    
    const holiday = yearHolidays.find(h => 
      h.date === date && (h.market === 'all' || h.market.includes(market) || h.affectedMarkets.includes(market))
    );

    const isHoliday = !!holiday;
    return !isHoliday && dateObj.getDay() !== 0 && dateObj.getDay() !== 6;
  }

  private findNextTradingDay(date: string, market: string): string | undefined {
    return this.findNextTradingDaySimple(date, market);
  }

  private findNextTradingDaySimple(date: string, market: string): string | undefined {
    const currentDate = new Date(date);
    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    for (let i = 0; i < 30; i++) { // Look ahead 30 days
      const dateStr = this.formatDate(nextDate);
      
      if (this.isTradingDaySimple(dateStr, market)) {
        return dateStr;
      }
      
      nextDate.setDate(nextDate.getDate() + 1);
    }

    return undefined;
  }

  private findPreviousTradingDay(date: string, market: string): string | undefined {
    return this.findPreviousTradingDaySimple(date, market);
  }

  private findPreviousTradingDaySimple(date: string, market: string): string | undefined {
    const currentDate = new Date(date);
    let prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    for (let i = 0; i < 30; i++) { // Look back 30 days
      const dateStr = this.formatDate(prevDate);
      
      if (this.isTradingDaySimple(dateStr, market)) {
        return dateStr;
      }
      
      prevDate.setDate(prevDate.getDate() - 1);
    }

    return undefined;
  }

  getMarketHolidaySchedule(market: string, year: number): MarketHolidaySchedule {
    const yearStr = year.toString();
    const allHolidays = this.holidays.get(yearStr) || [];
    const allSpecialSessions = this.specialSessions.get(yearStr) || [];

    const marketHolidays = allHolidays.filter(holiday => 
      holiday.market === 'all' || holiday.market.includes(market) || holiday.affectedMarkets.includes(market)
    );

    const marketSpecialSessions = allSpecialSessions.filter(session => 
      session.market === 'all' || session.market.includes(market)
    );

    // Calculate trading days
    const totalDaysInYear = this.isLeapYear(year) ? 366 : 365;
    const weekendDays = 104; // Approximately 52 weekends
    const tradingDays = totalDaysInYear - weekendDays - marketHolidays.length;

    return {
      market,
      year,
      holidays: marketHolidays,
      totalHolidays: marketHolidays.length,
      tradingDays,
      specialSessions: marketSpecialSessions
    };
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  getMarketHolidayStats(market: string, year: number): MarketHolidayStats {
    const schedule = this.getMarketHolidaySchedule(market, year);
    
    const publicHolidays = schedule.holidays.filter(h => h.type === 'public').length;
    const bankHolidays = schedule.holidays.filter(h => h.type === 'bank').length;
    const exchangeHolidays = schedule.holidays.filter(h => h.type === 'exchange').length;
    const fullDayHolidays = schedule.holidays.filter(h => h.impact === 'full').length;
    const partialDayHolidays = schedule.holidays.filter(h => h.impact === 'partial').length;
    const earlyCloseDays = schedule.specialSessions.filter(s => s.sessionType === 'early-close').length;

    // Find most common holiday month
    const monthCounts: { [key: string]: number } = {};
    schedule.holidays.forEach(holiday => {
      const month = holiday.date.substring(5, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const mostCommonMonth = Object.entries(monthCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '01';
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const mostCommonHolidayMonth = monthNames[parseInt(mostCommonMonth) - 1];

    // Find longest holiday period
    const longestHolidayPeriod = this.findLongestHolidayPeriod(schedule.holidays);

    return {
      market,
      year,
      totalHolidays: schedule.totalHolidays,
      publicHolidays,
      bankHolidays,
      exchangeHolidays,
      fullDayHolidays,
      partialDayHolidays,
      earlyCloseDays,
      mostCommonHolidayMonth,
      longestHolidayPeriod
    };
  }

  private findLongestHolidayPeriod(holidays: Holiday[]): {
    startDate: string;
    endDate: string;
    duration: number;
    holidays: Holiday[];
  } {
    if (holidays.length === 0) {
      return {
        startDate: '',
        endDate: '',
        duration: 0,
        holidays: []
      };
    }

    const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let longestPeriod = {
      startDate: sortedHolidays[0].date,
      endDate: sortedHolidays[0].date,
      duration: 1,
      holidays: [sortedHolidays[0]]
    };

    let currentPeriod = {
      startDate: sortedHolidays[0].date,
      endDate: sortedHolidays[0].date,
      duration: 1,
      holidays: [sortedHolidays[0]]
    };

    for (let i = 1; i < sortedHolidays.length; i++) {
      const currentHoliday = sortedHolidays[i];
      const prevDate = new Date(currentPeriod.endDate);
      const currentDate = new Date(currentHoliday.date);
      
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) { // Consider holidays within 3 days as part of the same period
        currentPeriod.endDate = currentHoliday.date;
        currentPeriod.duration = daysDiff + 1;
        currentPeriod.holidays.push(currentHoliday);
      } else {
        if (currentPeriod.duration > longestPeriod.duration) {
          longestPeriod = { ...currentPeriod };
        }
        
        currentPeriod = {
          startDate: currentHoliday.date,
          endDate: currentHoliday.date,
          duration: 1,
          holidays: [currentHoliday]
        };
      }
    }

    // Check the last period
    if (currentPeriod.duration > longestPeriod.duration) {
      longestPeriod = currentPeriod;
    }

    return longestPeriod;
  }

  getUpcomingHolidays(market: string, daysAhead: number = 30): Holiday[] {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return this.getHolidays({
      market,
      startDate: this.formatDate(today),
      endDate: this.formatDate(futureDate)
    });
  }

  isMarketOpen(date: string, market: string): boolean {
    const tradingInfo = this.getTradingDayInfo(date, market);
    return tradingInfo.isTradingDay;
  }

  getMarketHours(date: string, market: string): {
    open: string;
    close: string;
    isEarlyClose: boolean;
    adjustedHours?: {
      open: string;
      close: string;
      breakStart?: string;
      breakEnd?: string;
    };
  } {
    const tradingInfo = this.getTradingDayInfo(date, market);
    
    if (!tradingInfo.isTradingDay) {
      return {
        open: 'Closed',
        close: 'Closed',
        isEarlyClose: false
      };
    }

    const defaultHours = {
      'london': { open: '08:00', close: '16:30' },
      'euronext': { open: '09:00', close: '17:30' },
      'xetra': { open: '09:00', close: '17:30' },
      'six': { open: '09:00', close: '17:30' },
      'bme': { open: '09:00', close: '17:30' },
      'nasdaq-nordic': { open: '09:00', close: '17:25' },
      'oslo': { open: '09:00', close: '16:20' }
    };

    const marketHours = defaultHours[market as keyof typeof defaultHours] || { open: '09:00', close: '17:00' };

    if (tradingInfo.isEarlyClose && tradingInfo.specialSession) {
      return {
        open: tradingInfo.specialSession.adjustedHours.open,
        close: tradingInfo.specialSession.adjustedHours.close,
        isEarlyClose: true,
        adjustedHours: tradingInfo.specialSession.adjustedHours
      };
    }

    return {
      open: marketHours.open,
      close: marketHours.close,
      isEarlyClose: false
    };
  }
}

export const europeanHolidayCalendar = new EuropeanHolidayCalendar();
export default EuropeanHolidayCalendar;