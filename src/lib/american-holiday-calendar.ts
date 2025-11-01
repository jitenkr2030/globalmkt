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

class AmericanHolidayCalendar {
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
      { market: 'nyse', timezone: 'America/New_York' },
      { market: 'nasdaq', timezone: 'America/New_York' },
      { market: 'cme', timezone: 'America/Chicago' },
      { market: 'tsx', timezone: 'America/Toronto' },
      { market: 'bmv', timezone: 'America/Mexico_City' },
      { market: 'b3', timezone: 'America/Sao_Paulo' },
      { market: 'bca', timezone: 'America/Argentina/Buenos_Aires' }
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

    // US Federal Holidays
    const usHolidays = this.getUSFederalHolidays(year);
    holidays.push(...usHolidays);

    // Canadian Holidays
    const canadianHolidays = this.getCanadianHolidays(year);
    holidays.push(...canadianHolidays);

    // Mexican Holidays
    const mexicanHolidays = this.getMexicanHolidays(year);
    holidays.push(...mexicanHolidays);

    // Brazilian Holidays
    const brazilianHolidays = this.getBrazilianHolidays(year);
    holidays.push(...brazilianHolidays);

    // Argentine Holidays
    const argentineHolidays = this.getArgentineHolidays(year);
    holidays.push(...argentineHolidays);

    return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private getUSFederalHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `us-new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - US markets closed",
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Martin Luther King Jr. Day
    const mlkDay = this.calculateMLKDay(year);
    holidays.push({
      id: `mlk-day-${year}`,
      name: 'Martin Luther King Jr. Day',
      date: mlkDay,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Martin Luther King Jr. Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Presidents' Day
    const presidentsDay = this.calculatePresidentsDay(year);
    holidays.push({
      id: `presidents-day-${year}`,
      name: 'Presidents\' Day',
      date: presidentsDay,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Presidents\' Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Good Friday
    const goodFriday = this.calculateGoodFriday(year);
    holidays.push({
      id: `us-good-friday-${year}`,
      name: 'Good Friday',
      date: goodFriday,
      market: 'nyse,nasdaq',
      type: 'public',
      impact: 'full',
      description: 'Good Friday - US stock markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq']
    });

    // Memorial Day
    const memorialDay = this.calculateMemorialDay(year);
    holidays.push({
      id: `memorial-day-${year}`,
      name: 'Memorial Day',
      date: memorialDay,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Memorial Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Juneteenth
    holidays.push({
      id: `juneteenth-${year}`,
      name: 'Juneteenth National Independence Day',
      date: `${year}-06-19`,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Juneteenth - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Independence Day
    holidays.push({
      id: `independence-day-${year}`,
      name: 'Independence Day',
      date: `${year}-07-04`,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Independence Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Labor Day
    const laborDay = this.calculateLaborDay(year);
    holidays.push({
      id: `labor-day-${year}`,
      name: 'Labor Day',
      date: laborDay,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Columbus Day (markets open, but bond market closed)
    const columbusDay = this.calculateColumbusDay(year);
    holidays.push({
      id: `columbus-day-${year}`,
      name: 'Columbus Day',
      date: columbusDay,
      market: 'cme',
      type: 'public',
      impact: 'partial',
      description: 'Columbus Day - Bond markets closed, stock markets open',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['cme']
    });

    // Veterans Day
    holidays.push({
      id: `veterans-day-${year}`,
      name: 'Veterans Day',
      date: `${year}-11-11`,
      market: 'cme',
      type: 'public',
      impact: 'partial',
      description: 'Veterans Day - Bond markets closed, stock markets open',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['cme']
    });

    // Thanksgiving Day
    const thanksgiving = this.calculateThanksgiving(year);
    holidays.push({
      id: `thanksgiving-${year}`,
      name: 'Thanksgiving Day',
      date: thanksgiving,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Thanksgiving Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    // Christmas Day
    holidays.push({
      id: `us-christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'nyse,nasdaq,cme',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - US markets closed',
      recurring: true,
      regions: ['United States'],
      affectedMarkets: ['nyse', 'nasdaq', 'cme']
    });

    return holidays;
  }

  private getCanadianHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `canada-new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - TSX closed",
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Family Day
    const familyDay = this.calculateFamilyDay(year);
    holidays.push({
      id: `family-day-${year}`,
      name: 'Family Day',
      date: familyDay,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Family Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Good Friday
    const goodFriday = this.calculateGoodFriday(year);
    holidays.push({
      id: `canada-good-friday-${year}`,
      name: 'Good Friday',
      date: goodFriday,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Good Friday - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Victoria Day
    const victoriaDay = this.calculateVictoriaDay(year);
    holidays.push({
      id: `victoria-day-${year}`,
      name: 'Victoria Day',
      date: victoriaDay,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Victoria Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Canada Day
    holidays.push({
      id: `canada-day-${year}`,
      name: 'Canada Day',
      date: `${year}-07-01`,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Canada Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Civic Holiday
    const civicHoliday = this.calculateCivicHoliday(year);
    holidays.push({
      id: `civic-holiday-${year}`,
      name: 'Civic Holiday',
      date: civicHoliday,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Civic Holiday - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Labor Day
    const laborDay = this.calculateLaborDay(year);
    holidays.push({
      id: `canada-labor-day-${year}`,
      name: 'Labor Day',
      date: laborDay,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Thanksgiving Day
    const thanksgiving = this.calculateCanadianThanksgiving(year);
    holidays.push({
      id: `canada-thanksgiving-${year}`,
      name: 'Thanksgiving Day',
      date: thanksgiving,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Thanksgiving Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Christmas Day
    holidays.push({
      id: `canada-christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    // Boxing Day
    holidays.push({
      id: `canada-boxing-day-${year}`,
      name: 'Boxing Day',
      date: `${year}-12-26`,
      market: 'tsx',
      type: 'public',
      impact: 'full',
      description: 'Boxing Day - TSX closed',
      recurring: true,
      regions: ['Canada'],
      affectedMarkets: ['tsx']
    });

    return holidays;
  }

  private getMexicanHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `mexico-new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - BMV closed",
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Constitution Day
    holidays.push({
      id: `constitution-day-${year}`,
      name: 'Constitution Day',
      date: `${year}-02-05`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Constitution Day - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Benito Juárez's Birthday
    holidays.push({
      id: `benito-juarez-${year}`,
      name: 'Benito Juárez\'s Birthday',
      date: `${year}-03-21`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Benito Juárez\'s Birthday - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Labor Day
    holidays.push({
      id: `mexico-labor-day-${year}`,
      name: 'Labor Day',
      date: `${year}-05-01`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Independence Day
    holidays.push({
      id: `mexico-independence-${year}`,
      name: 'Independence Day',
      date: `${year}-09-16`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Independence Day - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Revolution Day
    holidays.push({
      id: `revolution-day-${year}`,
      name: 'Revolution Day',
      date: `${year}-11-20`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Revolution Day - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    // Christmas Day
    holidays.push({
      id: `mexico-christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'bmv',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - BMV closed',
      recurring: true,
      regions: ['Mexico'],
      affectedMarkets: ['bmv']
    });

    return holidays;
  }

  private getBrazilianHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `brazil-new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - B3 closed",
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Carnival
    const carnival = this.calculateCarnival(year);
    holidays.push({
      id: `carnival-${year}`,
      name: 'Carnival',
      date: carnival,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Carnival - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Good Friday
    const goodFriday = this.calculateGoodFriday(year);
    holidays.push({
      id: `brazil-good-friday-${year}`,
      name: 'Good Friday',
      date: goodFriday,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Good Friday - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Tiradentes Day
    holidays.push({
      id: `tiradentes-${year}`,
      name: 'Tiradentes Day',
      date: `${year}-04-21`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Tiradentes Day - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Labor Day
    holidays.push({
      id: `brazil-labor-day-${year}`,
      name: 'Labor Day',
      date: `${year}-05-01`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Independence Day
    holidays.push({
      id: `brazil-independence-${year}`,
      name: 'Independence Day',
      date: `${year}-09-07`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Independence Day - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Our Lady of Aparecida
    holidays.push({
      id: `aparecida-${year}`,
      name: 'Our Lady of Aparecida',
      date: `${year}-10-12`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Our Lady of Aparecida - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // All Souls' Day
    holidays.push({
      id: `finados-${year}`,
      name: 'All Souls\' Day',
      date: `${year}-11-02`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'All Souls\' Day - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Proclamation of the Republic
    holidays.push({
      id: `republic-${year}`,
      name: 'Proclamation of the Republic',
      date: `${year}-11-15`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Proclamation of the Republic - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    // Christmas Day
    holidays.push({
      id: `brazil-christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'b3',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - B3 closed',
      recurring: true,
      regions: ['Brazil'],
      affectedMarkets: ['b3']
    });

    return holidays;
  }

  private getArgentineHolidays(year: number): Holiday[] {
    const holidays: Holiday[] = [];

    // New Year's Day
    holidays.push({
      id: `argentina-new-year-${year}`,
      name: "New Year's Day",
      date: `${year}-01-01`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: "New Year's Day - BCBA closed",
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Carnival
    const carnival = this.calculateCarnival(year);
    holidays.push({
      id: `argentina-carnival-${year}`,
      name: 'Carnival',
      date: carnival,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Carnival - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Truth and Justice Memorial Day
    holidays.push({
      id: `truth-justice-${year}`,
      name: 'Truth and Justice Memorial Day',
      date: `${year}-03-24`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Truth and Justice Memorial Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Malvinas Day
    holidays.push({
      id: `malvinas-${year}`,
      name: 'Malvinas Day',
      date: `${year}-04-02`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Malvinas Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Labor Day
    holidays.push({
      id: `argentina-labor-day-${year}`,
      name: 'Labor Day',
      date: `${year}-05-01`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Labor Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // May Revolution Day
    holidays.push({
      id: `may-revolution-${year}`,
      name: 'May Revolution Day',
      date: `${year}-05-25`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'May Revolution Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Independence Day
    holidays.push({
      id: `argentina-independence-${year}`,
      name: 'Independence Day',
      date: `${year}-07-09`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Independence Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // General San Martín Day
    holidays.push({
      id: `san-martin-${year}`,
      name: 'General San Martín Day',
      date: `${year}-08-17`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'General San Martín Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Columbus Day
    holidays.push({
      id: `argentina-columbus-${year}`,
      name: 'Columbus Day',
      date: `${year}-10-12`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Columbus Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // National Sovereignty Day
    holidays.push({
      id: `sovereignty-${year}`,
      name: 'National Sovereignty Day',
      date: `${year}-11-20`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'National Sovereignty Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
    });

    // Christmas Day
    holidays.push({
      id: `argentina-christmas-${year}`,
      name: 'Christmas Day',
      date: `${year}-12-25`,
      market: 'bca',
      type: 'public',
      impact: 'full',
      description: 'Christmas Day - BCBA closed',
      recurring: true,
      regions: ['Argentina'],
      affectedMarkets: ['bca']
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

    // US Early Closes
    sessions.push({
      id: `us-black-friday-early-close-${year}`,
      date: this.calculateBlackFriday(year),
      market: 'nyse,nasdaq',
      sessionType: 'early-close',
      adjustedHours: {
        open: '09:30',
        close: '13:00'
      },
      reason: 'Black Friday - Early close',
      impact: 'high'
    });

    sessions.push({
      id: `us-christmas-eve-early-close-${year}`,
      date: `${year}-12-24`,
      market: 'nyse,nasdaq,cme',
      sessionType: 'early-close',
      adjustedHours: {
        open: '09:30',
        close: '13:00'
      },
      reason: 'Christmas Eve - Early close',
      impact: 'high'
    });

    sessions.push({
      id: `us-new-years-eve-early-close-${year}`,
      date: `${year}-12-31`,
      market: 'nyse,nasdaq,cme',
      sessionType: 'early-close',
      adjustedHours: {
        open: '09:30',
        close: '13:00'
      },
      reason: 'New Year\'s Eve - Early close',
      impact: 'high'
    });

    // Canadian Early Closes
    sessions.push({
      id: `canada-christmas-eve-early-close-${year}`,
      date: `${year}-12-24`,
      market: 'tsx',
      sessionType: 'early-close',
      adjustedHours: {
        open: '09:30',
        close: '13:00'
      },
      reason: 'Christmas Eve - Early close',
      impact: 'high'
    });

    sessions.push({
      id: `canada-new-years-eve-early-close-${year}`,
      date: `${year}-12-31`,
      market: 'tsx',
      sessionType: 'early-close',
      adjustedHours: {
        open: '09:30',
        close: '13:00'
      },
      reason: 'New Year\'s Eve - Early close',
      impact: 'high'
    });

    return sessions;
  }

  // US Holiday Calculation Methods
  private calculateMLKDay(year: number): string {
    // Third Monday in January
    const firstDay = new Date(year, 0, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    const mlkDay = new Date(firstMonday.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.formatDate(mlkDay);
  }

  private calculatePresidentsDay(year: number): string {
    // Third Monday in February
    const firstDay = new Date(year, 1, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    const presidentsDay = new Date(firstMonday.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.formatDate(presidentsDay);
  }

  private calculateMemorialDay(year: number): string {
    // Last Monday in May
    const lastDay = new Date(year, 5, 31);
    const lastMonday = this.findLastMonday(lastDay);
    return this.formatDate(lastMonday);
  }

  private calculateLaborDay(year: number): string {
    // First Monday in September
    const firstDay = new Date(year, 8, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    return this.formatDate(firstMonday);
  }

  private calculateColumbusDay(year: number): string {
    // Second Monday in October
    const firstDay = new Date(year, 9, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    const columbusDay = new Date(firstMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.formatDate(columbusDay);
  }

  private calculateThanksgiving(year: number): string {
    // Fourth Thursday in November
    const firstDay = new Date(year, 10, 1);
    const firstThursday = this.findFirstThursday(firstDay);
    const thanksgiving = new Date(firstThursday.getTime() + 21 * 24 * 60 * 60 * 1000);
    return this.formatDate(thanksgiving);
  }

  private calculateBlackFriday(year: number): string {
    // Day after Thanksgiving
    const thanksgiving = this.calculateThanksgiving(year);
    const thanksgivingDate = new Date(thanksgiving);
    const blackFriday = new Date(thanksgivingDate.getTime() + 24 * 60 * 60 * 1000);
    return this.formatDate(blackFriday);
  }

  // Canadian Holiday Calculation Methods
  private calculateFamilyDay(year: number): string {
    // Third Monday in February (most provinces)
    const firstDay = new Date(year, 1, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    const familyDay = new Date(firstMonday.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.formatDate(familyDay);
  }

  private calculateVictoriaDay(year: number): string {
    // Monday before May 25
    const may25 = new Date(year, 4, 25);
    const victoriaDay = this.findLastMonday(may25);
    return this.formatDate(victoriaDay);
  }

  private calculateCivicHoliday(year: number): string {
    // First Monday in August
    const firstDay = new Date(year, 7, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    return this.formatDate(firstMonday);
  }

  private calculateCanadianThanksgiving(year: number): string {
    // Second Monday in October
    const firstDay = new Date(year, 9, 1);
    const firstMonday = this.findFirstMonday(firstDay);
    const thanksgiving = new Date(firstMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.formatDate(thanksgiving);
  }

  // Brazilian Holiday Calculation Methods
  private calculateCarnival(year: number): string {
    // Carnival is 47 days before Easter Sunday
    const easter = this.calculateEaster(year);
    const carnival = new Date(easter.getTime() - 47 * 24 * 60 * 60 * 1000);
    return this.formatDate(carnival);
  }

  // Common Holiday Calculation Methods
  private calculateGoodFriday(year: number): string {
    const easter = this.calculateEaster(year);
    const goodFriday = new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000);
    return this.formatDate(goodFriday);
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
  private findFirstMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
    return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  }

  private findLastMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const daysFromMonday = (dayOfWeek - 1 + 7) % 7;
    return new Date(date.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
  }

  private findFirstThursday(date: Date): Date {
    const dayOfWeek = date.getDay();
    const daysUntilThursday = dayOfWeek === 4 ? 0 : (11 - dayOfWeek) % 7;
    return new Date(date.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000);
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
      h.date === date && (h.market.includes(market) || h.affectedMarkets.includes(market))
    );
    
    const specialSession = yearSpecialSessions.find(s => 
      s.date === date && (s.market.includes(market) || s.market === 'all')
    );
    
    const isHoliday = !!holiday;
    const isEarlyClose = !!specialSession;
    const isTradingDay = !isHoliday && dateObj.getDay() !== 0 && dateObj.getDay() !== 6;
    
    return {
      date,
      market,
      isTradingDay,
      isHoliday,
      holiday,
      isEarlyClose,
      specialSession
    };
  }

  getMarketHolidaySchedule(market: string, year: number): MarketHolidaySchedule {
    const yearStr = year.toString();
    const holidays = this.holidays.get(yearStr) || [];
    const specialSessions = this.specialSessions.get(yearStr) || [];
    
    const marketHolidays = holidays.filter(h => 
      h.market.includes(market) || h.affectedMarkets.includes(market)
    );
    
    const marketSpecialSessions = specialSessions.filter(s => 
      s.market.includes(market) || s.market === 'all'
    );
    
    const totalHolidays = marketHolidays.length;
    const tradingDays = 252 - totalHolidays; // Approximate trading days in a year
    
    return {
      market,
      year,
      holidays: marketHolidays,
      totalHolidays,
      tradingDays,
      specialSessions: marketSpecialSessions
    };
  }

  getMarketHolidayStats(market: string, year: number): MarketHolidayStats {
    const schedule = this.getMarketHolidaySchedule(market, year);
    
    const publicHolidays = schedule.holidays.filter(h => h.type === 'public').length;
    const bankHolidays = schedule.holidays.filter(h => h.type === 'bank').length;
    const exchangeHolidays = schedule.holidays.filter(h => h.type === 'exchange').length;
    const fullDayHolidays = schedule.holidays.filter(h => h.impact === 'full').length;
    const partialDayHolidays = schedule.holidays.filter(h => h.impact === 'partial').length;
    const earlyCloseDays = schedule.specialSessions.length;
    
    // Find most common holiday month
    const monthCounts: Record<string, number> = {};
    schedule.holidays.forEach(holiday => {
      const month = holiday.date.substring(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const mostCommonHolidayMonth = Object.entries(monthCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    // Find longest holiday period
    const sortedHolidays = [...schedule.holidays].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let longestPeriod = {
      startDate: '',
      endDate: '',
      duration: 0,
      holidays: [] as Holiday[]
    };
    
    for (let i = 0; i < sortedHolidays.length; i++) {
      const currentPeriod = {
        startDate: sortedHolidays[i].date,
        endDate: sortedHolidays[i].date,
        duration: 1,
        holidays: [sortedHolidays[i]]
      };
      
      for (let j = i + 1; j < sortedHolidays.length; j++) {
        const currentDate = new Date(sortedHolidays[j].date);
        const prevDate = new Date(sortedHolidays[j - 1].date);
        const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);
        
        if (daysDiff <= 3) { // Allow weekends and small gaps
          currentPeriod.endDate = sortedHolidays[j].date;
          currentPeriod.duration++;
          currentPeriod.holidays.push(sortedHolidays[j]);
        } else {
          break;
        }
      }
      
      if (currentPeriod.duration > longestPeriod.duration) {
        longestPeriod = currentPeriod;
      }
    }
    
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
      longestHolidayPeriod: longestPeriod
    };
  }

  getMarketTimezone(market: string): string | undefined {
    return this.marketTimezones.get(market);
  }

  isTradingDay(date: string, market: string): boolean {
    const dayInfo = this.getTradingDayInfo(date, market);
    return dayInfo.isTradingDay;
  }

  getNextTradingDay(date: string, market: string): string | undefined {
    let currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    
    for (let i = 0; i < 30; i++) { // Look ahead 30 days max
      const dateStr = this.formatDate(currentDate);
      if (this.isTradingDay(dateStr, market)) {
        return dateStr;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return undefined;
  }

  getPreviousTradingDay(date: string, market: string): string | undefined {
    let currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    
    for (let i = 0; i < 30; i++) { // Look back 30 days max
      const dateStr = this.formatDate(currentDate);
      if (this.isTradingDay(dateStr, market)) {
        return dateStr;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return undefined;
  }
}

// Export singleton instance
export const americanHolidayCalendar = new AmericanHolidayCalendar();
export default AmericanHolidayCalendar;