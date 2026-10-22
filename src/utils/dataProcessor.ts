import Papa from 'papaparse';
import {
  StandardEventRecord,
  StandardColumnKey,
  ColumnDefinition,
  ColumnMapping,
  DataQualityReport,
  ColumnQualityReport,
  FilterState,
  SummaryMetrics,
  InsightItem,
} from '../types';

export const STANDARD_COLUMNS: ColumnDefinition[] = [
  {
    key: 'id',
    label: 'Event ID',
    required: false,
    type: 'string',
    synonyms: ['event_id', 'eventid', 'id', 'record_id', 'event_code', 'code'],
  },
  {
    key: 'eventName',
    label: 'Event Name',
    required: true,
    type: 'string',
    synonyms: ['event_name', 'eventname', 'name', 'title', 'event_title', 'event', 'program_name'],
  },
  {
    key: 'category',
    label: 'Category',
    required: false,
    type: 'string',
    synonyms: ['category', 'event_category', 'type', 'genre', 'stream'],
  },
  {
    key: 'department',
    label: 'Department',
    required: false,
    type: 'string',
    synonyms: ['department', 'dept', 'organizer', 'branch', 'faculty', 'school'],
  },
  {
    key: 'eventDate',
    label: 'Event Date',
    required: false,
    type: 'date',
    synonyms: ['event_date', 'date', 'datetime', 'start_date', 'event_day', 'timestamp'],
  },
  {
    key: 'participants',
    label: 'Participants',
    required: true,
    type: 'number',
    synonyms: ['participants', 'attendees', 'attendance', 'students', 'turnout', 'headcount', 'participants_count'],
  },
  {
    key: 'capacity',
    label: 'Capacity',
    required: false,
    type: 'number',
    synonyms: ['capacity', 'max_capacity', 'venue_capacity', 'total_seats', 'seats', 'target_attendance'],
  },
  {
    key: 'rating',
    label: 'Rating',
    required: false,
    type: 'number',
    synonyms: ['rating', 'average_rating', 'score', 'feedback_score', 'stars', 'satisfaction'],
  },
  {
    key: 'budget',
    label: 'Budget ($/₹)',
    required: false,
    type: 'number',
    synonyms: ['budget', 'event_budget', 'cost', 'expenditure', 'total_budget', 'funds'],
  },
  {
    key: 'venue',
    label: 'Venue',
    required: false,
    type: 'string',
    synonyms: ['venue', 'location', 'hall', 'room', 'auditorium', 'place'],
  },
  {
    key: 'durationHours',
    label: 'Duration (Hours)',
    required: false,
    type: 'number',
    synonyms: ['event_duration', 'duration', 'duration_hours', 'hours', 'length_hours'],
  },
  {
    key: 'feedbackCount',
    label: 'Feedback Count',
    required: false,
    type: 'number',
    synonyms: ['feedback_count', 'feedback', 'reviews', 'responses', 'ratings_count', 'survey_count'],
  },
];

// Clean header string for robust matching
function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Automatically inspects uploaded headers and maps them to standard columns
 */
export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    id: null,
    eventName: null,
    category: null,
    department: null,
    eventDate: null,
    participants: null,
    capacity: null,
    rating: null,
    budget: null,
    venue: null,
    durationHours: null,
    feedbackCount: null,
  };

  const normalizedHeaders = headers.map((h) => ({
    original: h,
    clean: normalizeHeader(h),
  }));

  for (const col of STANDARD_COLUMNS) {
    // 1. Exact match on synonyms
    const matched = normalizedHeaders.find((nh) =>
      col.synonyms.some((syn) => normalizeHeader(syn) === nh.clean)
    );

    if (matched) {
      mapping[col.key] = matched.original;
      continue;
    }

    // 2. Substring fuzzy match
    const fuzzyMatch = normalizedHeaders.find((nh) =>
      col.synonyms.some((syn) => nh.clean.includes(normalizeHeader(syn)))
    );

    if (fuzzyMatch) {
      mapping[col.key] = fuzzyMatch.original;
    }
  }

  return mapping;
}

/**
 * Safely parse numeric values from strings, handling commas, currencies, percentages, and NaN
 */
export function parseNumericSafe(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  const cleanStr = String(value).replace(/[^0-9.-]/g, '').trim();
  if (cleanStr === '') return null;
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : num;
}

/**
 * Safely parse date string into standard YYYY-MM-DD
 */
export function parseDateSafe(value: unknown, fallbackIndex: number): string {
  if (!value) {
    const month = (fallbackIndex % 12) + 1;
    const day = (fallbackIndex % 28) + 1;
    return `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const str = String(value).trim();
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    try {
      return dateObj.toISOString().split('T')[0];
    } catch {
      // fallback
    }
  }
  return str;
}

/**
 * Normalize raw parsed CSV rows into StandardEventRecord[], detecting duplicates and missing values
 */
export function processRawCSVData(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping,
  removeDuplicates: boolean = true
): {
  records: StandardEventRecord[];
  qualityReport: DataQualityReport;
} {
  const totalRawRows = rawRows.length;
  const qualityMap: Record<StandardColumnKey, ColumnQualityReport> = {} as Record<StandardColumnKey, ColumnQualityReport>;

  for (const col of STANDARD_COLUMNS) {
    qualityMap[col.key] = {
      columnKey: col.key,
      headerName: mapping[col.key],
      detected: !!mapping[col.key],
      totalRows: totalRawRows,
      validRows: 0,
      missingRows: 0,
      invalidRows: 0,
      completenessPercent: 0,
    };
  }

  const seenKeys = new Set<string>();
  let duplicateCount = 0;
  const validRecords: StandardEventRecord[] = [];

  rawRows.forEach((row, index) => {
    // Check duplicate
    const idHeader = mapping.id;
    const nameHeader = mapping.eventName;
    const dateHeader = mapping.eventDate;

    const rawId = idHeader && row[idHeader] ? String(row[idHeader]).trim() : '';
    const rawName = nameHeader && row[nameHeader] ? String(row[nameHeader]).trim() : `Event #${index + 1}`;
    const rawDate = dateHeader && row[dateHeader] ? String(row[dateHeader]).trim() : '';

    const dedupKey = rawId ? `ID:${rawId}` : `NAME:${rawName.toLowerCase()}|DATE:${rawDate}`;

    if (seenKeys.has(dedupKey) && dedupKey !== '') {
      duplicateCount++;
      if (removeDuplicates) {
        return; // skip duplicate
      }
    } else if (dedupKey !== '') {
      seenKeys.add(dedupKey);
    }

    // Process fields
    const id = rawId || `EVT-${String(index + 1).padStart(4, '0')}`;
    const eventName = rawName || `Campus Event ${index + 1}`;

    const catHeader = mapping.category;
    const category = catHeader && row[catHeader] ? String(row[catHeader]).trim() : 'General';

    const deptHeader = mapping.department;
    const department = deptHeader && row[deptHeader] ? String(row[deptHeader]).trim() : 'General Campus';

    const eventDate = parseDateSafe(dateHeader ? row[dateHeader] : null, index);

    // Numeric fields
    const partHeader = mapping.participants;
    const parsedParticipants = partHeader ? parseNumericSafe(row[partHeader]) : null;
    const participants = parsedParticipants !== null ? Math.max(0, Math.round(parsedParticipants)) : 50;

    const capHeader = mapping.capacity;
    const parsedCapacity = capHeader ? parseNumericSafe(row[capHeader]) : null;
    const capacity = parsedCapacity !== null ? Math.max(0, Math.round(parsedCapacity)) : 0;

    const ratHeader = mapping.rating;
    const parsedRating = ratHeader ? parseNumericSafe(row[ratHeader]) : null;
    const rating = parsedRating !== null ? Math.min(5.0, Math.max(0, Number(parsedRating.toFixed(1)))) : 0;

    const budHeader = mapping.budget;
    const parsedBudget = budHeader ? parseNumericSafe(row[budHeader]) : null;
    const budget = parsedBudget !== null ? Math.max(0, Math.round(parsedBudget)) : 0;

    const venHeader = mapping.venue;
    const venue = venHeader && row[venHeader] ? String(row[venHeader]).trim() : 'Campus Grounds';

    const durHeader = mapping.durationHours;
    const parsedDur = durHeader ? parseNumericSafe(row[durHeader]) : null;
    const durationHours = parsedDur !== null ? Math.max(0.5, Number(parsedDur.toFixed(1))) : 3.0;

    const fdbHeader = mapping.feedbackCount;
    const parsedFdb = fdbHeader ? parseNumericSafe(row[fdbHeader]) : null;
    const feedbackCount = parsedFdb !== null ? Math.max(0, Math.round(parsedFdb)) : 0;

    // Quality stats accounting
    for (const col of STANDARD_COLUMNS) {
      const header = mapping[col.key];
      const q = qualityMap[col.key];
      if (!header || row[header] === undefined || row[header] === null || String(row[header]).trim() === '') {
        q.missingRows++;
      } else if (col.type === 'number') {
        const testNum = parseNumericSafe(row[header]);
        if (testNum === null) {
          q.invalidRows++;
        } else {
          q.validRows++;
        }
      } else {
        q.validRows++;
      }
    }

    const capacityUtilization = capacity > 0 ? Number(((participants / capacity) * 100).toFixed(1)) : 0;
    const budgetPerParticipant = participants > 0 && budget > 0 ? Number((budget / participants).toFixed(1)) : 0;
    const feedbackRatio = participants > 0 && feedbackCount > 0 ? Number((feedbackCount / participants).toFixed(2)) : 0;

    validRecords.push({
      id,
      eventName,
      category,
      department,
      eventDate,
      participants,
      capacity,
      rating,
      budget,
      venue,
      durationHours,
      feedbackCount,
      capacityUtilization,
      budgetPerParticipant,
      feedbackRatio,
    });
  });

  // Calculate completeness percentages
  for (const col of STANDARD_COLUMNS) {
    const q = qualityMap[col.key];
    q.completenessPercent = totalRawRows > 0 ? Number(((q.validRows / totalRawRows) * 100).toFixed(1)) : 0;
  }

  const criticalWarnings: string[] = [];
  if (!mapping.eventName) {
    criticalWarnings.push('Event Name column could not be automatically detected. Using generated event numbers.');
  }
  if (!mapping.participants) {
    criticalWarnings.push('Participants column was missing; defaulted to sample attendance count of 50.');
  }
  if (!mapping.capacity) {
    criticalWarnings.push('Capacity column not detected. Capacity utilization metrics will be omitted or based on nominal capacity.');
  }
  if (duplicateCount > 0) {
    criticalWarnings.push(`Detected ${duplicateCount} duplicate records in uploaded data.`);
  }

  const detectedColumnsCount = Object.values(mapping).filter((v) => v !== null).length;

  const qualityReport: DataQualityReport = {
    totalRawRows,
    totalProcessedRows: validRecords.length,
    duplicateCount,
    detectedColumnsCount,
    totalStandardColumns: STANDARD_COLUMNS.length,
    columnsReport: Object.values(qualityMap),
    criticalWarnings,
  };

  return {
    records: validRecords,
    qualityReport,
  };
}

/**
 * Filter records by department, category, venue, date range, and search query
 */
export function applyFilters(records: StandardEventRecord[], filters: FilterState): StandardEventRecord[] {
  return records.filter((r) => {
    if (filters.department && filters.department !== 'ALL' && r.department !== filters.department) {
      return false;
    }
    if (filters.category && filters.category !== 'ALL' && r.category !== filters.category) {
      return false;
    }
    if (filters.venue && filters.venue !== 'ALL' && r.venue !== filters.venue) {
      return false;
    }
    if (filters.startDate && r.eventDate < filters.startDate) {
      return false;
    }
    if (filters.endDate && r.eventDate > filters.endDate) {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        r.eventName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.venue.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

/**
 * Compute primary summary metrics from filtered records
 */
export function computeSummaryMetrics(
  records: StandardEventRecord[],
  columnMapping?: ColumnMapping
): SummaryMetrics {
  const totalEvents = records.length;
  if (totalEvents === 0) {
    return {
      totalEvents: 0,
      totalParticipants: 0,
      averageRating: null,
      averageCapacityUtilization: null,
      totalBudget: null,
      departmentCount: 0,
      averageBudgetPerEvent: null,
      averageParticipantsPerEvent: null,
      hasCapacityData: false,
      hasRatingData: false,
      hasBudgetData: false,
      hasFeedbackData: false,
    };
  }

  const hasCapacityData = columnMapping ? !!columnMapping.capacity : records.some((r) => r.capacity > 0);
  const hasRatingData = columnMapping ? !!columnMapping.rating : records.some((r) => r.rating > 0);
  const hasBudgetData = columnMapping ? !!columnMapping.budget : records.some((r) => r.budget > 0);
  const hasFeedbackData = columnMapping ? !!columnMapping.feedbackCount : records.some((r) => r.feedbackCount > 0);

  const totalParticipants = records.reduce((sum, r) => sum + r.participants, 0);

  // Departments
  const departmentsSet = new Set(records.map((r) => r.department));
  const departmentCount = departmentsSet.size;

  // Average Rating
  const validRatingRecords = records.filter((r) => r.rating > 0);
  const averageRating =
    hasRatingData && validRatingRecords.length > 0
      ? Number((validRatingRecords.reduce((sum, r) => sum + r.rating, 0) / validRatingRecords.length).toFixed(2))
      : null;

  // Average Capacity Utilization
  const validCapacityRecords = records.filter((r) => r.capacity > 0);
  const averageCapacityUtilization =
    hasCapacityData && validCapacityRecords.length > 0
      ? Number(
          (
            validCapacityRecords.reduce((sum, r) => sum + (r.participants / r.capacity) * 100, 0) /
            validCapacityRecords.length
          ).toFixed(1)
        )
      : null;

  // Total Budget
  const totalBudget = hasBudgetData ? records.reduce((sum, r) => sum + r.budget, 0) : null;
  const averageBudgetPerEvent = totalBudget !== null && totalEvents > 0 ? Math.round(totalBudget / totalEvents) : null;
  const averageParticipantsPerEvent = Math.round(totalParticipants / totalEvents);

  return {
    totalEvents,
    totalParticipants,
    averageRating,
    averageCapacityUtilization,
    totalBudget,
    departmentCount,
    averageBudgetPerEvent,
    averageParticipantsPerEvent,
    hasCapacityData,
    hasRatingData,
    hasBudgetData,
    hasFeedbackData,
  };
}

/**
 * Generates automated analytical insights grounded strictly in the processed dataset
 */
export function generateRealDataInsights(records: StandardEventRecord[], metrics: SummaryMetrics): InsightItem[] {
  if (records.length === 0) return [];
  const insights: InsightItem[] = [];

  // 1. Top department insight
  const deptMap: Record<string, number> = {};
  records.forEach((r) => {
    deptMap[r.department] = (deptMap[r.department] || 0) + r.participants;
  });
  const sortedDepts = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  if (sortedDepts.length > 0) {
    const topDept = sortedDepts[0];
    const topDeptShare = metrics.totalParticipants > 0 ? ((topDept[1] / metrics.totalParticipants) * 100).toFixed(1) : '0';
    insights.push({
      id: 'top-dept',
      title: 'Highest-Participation Department',
      category: 'highlight',
      description: `${topDept[0]} accounts for ${topDept[1].toLocaleString()} student attendees (${topDeptShare}% of campus turnout).`,
      metricValue: `${topDept[1].toLocaleString()} students`,
    });
  }

  // 2. Capacity Utilization Insight
  if (metrics.hasCapacityData && metrics.averageCapacityUtilization !== null) {
    const overCapacityCount = records.filter((r) => r.capacity > 0 && r.capacityUtilization > 100).length;
    const underCapacityCount = records.filter((r) => r.capacity > 0 && r.capacityUtilization < 50).length;

    if (overCapacityCount > 0) {
      insights.push({
        id: 'capacity-surge',
        title: 'High Demand Over-Capacity Events',
        category: 'trend',
        description: `${overCapacityCount} events exceeded 100% capacity limit, pointing to strong student appetite for high-demand topics.`,
        metricValue: `${overCapacityCount} events`,
      });
    }

    if (underCapacityCount > 0) {
      insights.push({
        id: 'capacity-warning',
        title: 'Low Attendance Identified',
        category: 'warning',
        description: `${underCapacityCount} events experienced attendance below 50% capacity. Review scheduling or venue sizing.`,
        metricValue: `${underCapacityCount} events <50%`,
      });
    }
  }

  // 3. Category Rating Insight
  if (metrics.hasRatingData) {
    const catRatings: Record<string, { total: number; count: number }> = {};
    records.forEach((r) => {
      if (r.rating > 0) {
        if (!catRatings[r.category]) catRatings[r.category] = { total: 0, count: 0 };
        catRatings[r.category].total += r.rating;
        catRatings[r.category].count += 1;
      }
    });
    const avgCatRatings = Object.entries(catRatings)
      .map(([cat, val]) => ({ category: cat, avg: val.total / val.count }))
      .sort((a, b) => b.avg - a.avg);

    if (avgCatRatings.length > 0) {
      const bestCat = avgCatRatings[0];
      insights.push({
        id: 'top-rated-cat',
        title: 'Top-Rated Event Category',
        category: 'highlight',
        description: `${bestCat.category} achieves the highest average satisfaction rating of ${bestCat.avg.toFixed(2)} / 5.0.`,
        metricValue: `${bestCat.avg.toFixed(2)} ★`,
      });
    }
  }

  // 4. Budget Efficiency Insight
  if (metrics.hasBudgetData && metrics.totalBudget !== null && metrics.totalParticipants > 0) {
    const overallCostPerHead = (metrics.totalBudget / metrics.totalParticipants).toFixed(1);
    insights.push({
      id: 'cost-per-head',
      title: 'Overall Budget Efficiency',
      category: 'recommendation',
      description: `Campus events average $${overallCostPerHead} per student participant across all organized sessions.`,
      metricValue: `$${overallCostPerHead} / attendee`,
    });
  }

  return insights;
}

/**
 * Aggregations for the 10 interactive charts:
 */

// 1. Bar chart: Number of events by category
export function aggregateEventsByCategory(records: StandardEventRecord[]): { category: string; count: number }[] {
  const map: Record<string, number> = {};
  records.forEach((r) => {
    map[r.category] = (map[r.category] || 0) + 1;
  });
  return Object.entries(map)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// 2. Bar chart: Total participants by department
export function aggregateParticipantsByDepartment(
  records: StandardEventRecord[]
): { department: string; participants: number; eventCount: number }[] {
  const map: Record<string, { participants: number; count: number }> = {};
  records.forEach((r) => {
    if (!map[r.department]) map[r.department] = { participants: 0, count: 0 };
    map[r.department].participants += r.participants;
    map[r.department].count += 1;
  });
  return Object.entries(map)
    .map(([department, data]) => ({
      department,
      participants: data.participants,
      eventCount: data.count,
    }))
    .sort((a, b) => b.participants - a.participants);
}

// 3. Line chart: Event participation over time (by month YYYY-MM)
export function aggregateParticipationOverTime(
  records: StandardEventRecord[]
): { month: string; participants: number; eventCount: number }[] {
  const map: Record<string, { participants: number; count: number }> = {};
  records.forEach((r) => {
    const monthKey = r.eventDate ? r.eventDate.substring(0, 7) : 'Unknown';
    if (!map[monthKey]) map[monthKey] = { participants: 0, count: 0 };
    map[monthKey].participants += r.participants;
    map[monthKey].count += 1;
  });
  return Object.keys(map)
    .sort()
    .map((month) => ({
      month,
      participants: map[month].participants,
      eventCount: map[month].count,
    }));
}

// 4. Pie chart: Distribution of events by category
export function aggregateCategoryDistribution(
  records: StandardEventRecord[]
): { name: string; value: number; percentage: number }[] {
  const total = records.length;
  if (total === 0) return [];
  const map: Record<string, number> = {};
  records.forEach((r) => {
    map[r.category] = (map[r.category] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    percentage: Number(((value / total) * 100).toFixed(1)),
  }));
}

// 5. Bar chart: Top 10 events by participants
export function getTopEventsByParticipants(records: StandardEventRecord[], limit: number = 10): StandardEventRecord[] {
  return [...records].sort((a, b) => b.participants - a.participants).slice(0, limit);
}

// Low attendance events (< 50% capacity or lowest participants)
export function getLowAttendanceEvents(records: StandardEventRecord[], limit: number = 10): StandardEventRecord[] {
  const withCapacity = records.filter((r) => r.capacity > 0);
  if (withCapacity.length > 0) {
    return [...withCapacity].sort((a, b) => a.capacityUtilization - b.capacityUtilization).slice(0, limit);
  }
  return [...records].sort((a, b) => a.participants - b.participants).slice(0, limit);
}

// 6. Scatter plot: Event capacity versus participants
export function getCapacityVsParticipantsData(
  records: StandardEventRecord[],
  maxSamples: number = 200
): {
  id: string;
  name: string;
  capacity: number;
  participants: number;
  utilization: number;
  category: string;
  department: string;
}[] {
  const valid = records.filter((r) => r.capacity > 0 && r.participants > 0);
  const step = Math.max(1, Math.floor(valid.length / maxSamples));
  return valid
    .filter((_, idx) => idx % step === 0)
    .slice(0, maxSamples)
    .map((r) => ({
      id: r.id,
      name: r.eventName,
      capacity: r.capacity,
      participants: r.participants,
      utilization: r.capacityUtilization,
      category: r.category,
      department: r.department,
    }));
}

// 7. Bar chart: Average rating by event category
export function aggregateRatingByCategory(
  records: StandardEventRecord[]
): { category: string; averageRating: number; count: number }[] {
  const map: Record<string, { totalRating: number; count: number }> = {};
  records.forEach((r) => {
    if (r.rating > 0) {
      if (!map[r.category]) map[r.category] = { totalRating: 0, count: 0 };
      map[r.category].totalRating += r.rating;
      map[r.category].count += 1;
    }
  });
  return Object.entries(map)
    .map(([category, val]) => ({
      category,
      averageRating: Number((val.totalRating / val.count).toFixed(2)),
      count: val.count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating);
}

// 8. Bar chart: Event budget by department
export function aggregateBudgetByDepartment(
  records: StandardEventRecord[]
): { department: string; totalBudget: number; avgBudget: number; count: number }[] {
  const map: Record<string, { totalBudget: number; count: number }> = {};
  records.forEach((r) => {
    if (r.budget > 0) {
      if (!map[r.department]) map[r.department] = { totalBudget: 0, count: 0 };
      map[r.department].totalBudget += r.budget;
      map[r.department].count += 1;
    }
  });
  return Object.entries(map)
    .map(([department, val]) => ({
      department,
      totalBudget: val.totalBudget,
      avgBudget: Math.round(val.totalBudget / val.count),
      count: val.count,
    }))
    .sort((a, b) => b.totalBudget - a.totalBudget);
}

// 9. Bar chart: Capacity utilization by category or top events
export function aggregateCapacityUtilizationByCategory(
  records: StandardEventRecord[]
): { category: string; averageUtilization: number; count: number }[] {
  const map: Record<string, { totalUtil: number; count: number }> = {};
  records.forEach((r) => {
    if (r.capacity > 0) {
      if (!map[r.category]) map[r.category] = { totalUtil: 0, count: 0 };
      map[r.category].totalUtil += r.capacityUtilization;
      map[r.category].count += 1;
    }
  });
  return Object.entries(map)
    .map(([category, val]) => ({
      category,
      averageUtilization: Number((val.totalUtil / val.count).toFixed(1)),
      count: val.count,
    }))
    .sort((a, b) => b.averageUtilization - a.averageUtilization);
}

// 10. Feedback analysis chart: Feedback count vs Category or Rating
export function aggregateFeedbackByCategory(
  records: StandardEventRecord[]
): { category: string; totalFeedback: number; avgFeedbackPerEvent: number }[] {
  const map: Record<string, { totalFeedback: number; count: number }> = {};
  records.forEach((r) => {
    if (r.feedbackCount > 0) {
      if (!map[r.category]) map[r.category] = { totalFeedback: 0, count: 0 };
      map[r.category].totalFeedback += r.feedbackCount;
      map[r.category].count += 1;
    }
  });
  return Object.entries(map)
    .map(([category, val]) => ({
      category,
      totalFeedback: val.totalFeedback,
      avgFeedbackPerEvent: Math.round(val.totalFeedback / val.count),
    }))
    .sort((a, b) => b.totalFeedback - a.totalFeedback);
}

/**
 * Export processed records to CSV
 */
export function exportRecordsToCSV(records: StandardEventRecord[], filename = 'campus_events_processed.csv'): void {
  const exportData = records.map((r) => ({
    Event_ID: r.id,
    Event_Name: r.eventName,
    Category: r.category,
    Department: r.department,
    Event_Date: r.eventDate,
    Participants: r.participants,
    Capacity: r.capacity,
    Rating: r.rating,
    Budget: r.budget,
    Venue: r.venue,
    Event_Duration: r.durationHours,
    Feedback_Count: r.feedbackCount,
    Capacity_Utilization_Percent: r.capacityUtilization,
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
