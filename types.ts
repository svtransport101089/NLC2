

export interface GroupHeaderData {
  nlcNo: string;
  region: string;
  areaPastor: string;
  leaderName: string; // Reverted to string
  coLeader: string; // Reverted to string
  year: string;
}

export interface Member {
  id: string;
  sn: number;
  name: string;
  regNo: string;
  phone: string;
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterlyUpdate {
  category: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

export interface NLCReport {
  id: string; // Unique ID for each NLC Report
  header: GroupHeaderData;
  members: Member[];
  updates: QuarterlyUpdate[];
}

export const CATEGORIES = [
  'Challenges',
  'Improvement',
  'Plan / Follow-up',
  'Baptism',
  'Holy Spirit Baptism',
  'New Comer',
  'Special Meeting'
];

export const QUARTER_LABELS: Record<Quarter, string> = {
  Q1: 'Jan-Mar',
  Q2: 'Apr-Jun',
  Q3: 'Jul-Sep',
  Q4: 'Oct-Dec'
};
