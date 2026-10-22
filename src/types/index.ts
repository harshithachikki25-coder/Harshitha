export interface StandardEventRecord {
  id: string;
  eventName: string;
  category: string;
  department: string;
  eventDate: string; // YYYY-MM-DD
  participants: number;
  capacity: number;
  rating: number; // 1.0 to 5.0
  budget: number; // in USD or INR
  venue: string;
  durationHours: number;
  feedbackCount: number;
  // Computed fields
  capacityUtilization: number; // (participants / capacity) * 100
  budgetPerParticipant: number;
  feedbackRatio: number; // feedbackCount / participants
}

export type StandardColumnKey = 
  | 'id'
  | 'eventName'
  | 'category'
  | 'department'
  | 'eventDate'
  | 'participants'
  | 'capacity'
  | 'rating'
  | 'budget'
  | 'venue'
  | 'durationHours'
  | 'feedbackCount';

export interface ColumnDefinition {
  key: StandardColumnKey;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date';
  synonyms: string[];
}

export type ColumnMapping = Record<StandardColumnKey, string | null>;

export interface ColumnQualityReport {
  columnKey: StandardColumnKey;
  headerName: string | null;
  detected: boolean;
  totalRows: number;
  validRows: number;
  missingRows: number;
  invalidRows: number;
  completenessPercent: number;
}

export interface DataQualityReport {
  totalRawRows: number;
  totalProcessedRows: number;
  duplicateCount: number;
  detectedColumnsCount: number;
  totalStandardColumns: number;
  columnsReport: ColumnQualityReport[];
  criticalWarnings: string[];
}

export interface FilterState {
  department: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  searchQuery: string;
}

export interface SummaryMetrics {
  totalEvents: number;
  totalParticipants: number;
  averageRating: number | null;
  averageCapacityUtilization: number | null;
  totalBudget: number | null;
  departmentCount: number;
  averageBudgetPerEvent: number | null;
  averageParticipantsPerEvent: number | null;
  hasCapacityData: boolean;
  hasRatingData: boolean;
  hasBudgetData: boolean;
  hasFeedbackData: boolean;
}

export interface InsightItem {
  id: string;
  title: string;
  category: 'highlight' | 'warning' | 'trend' | 'recommendation';
  description: string;
  metricValue?: string;
}
