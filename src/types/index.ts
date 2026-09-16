export type ApplicationStatus =
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Completed';

export const STATUS_OPTIONS: ApplicationStatus[] = [
  'Applied',
  'Shortlisted',
  'Interview',
  'Selected',
  'Rejected',
  'Completed',
];

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Finance',
  'Marketing',
  'Human Resources',
  'Other',
];

export interface Internship {
  id: string;
  student_name: string;
  student_email: string;
  department: string;
  company_name: string;
  internship_role: string;
  location: string;
  duration: string;
  stipend: number;
  application_date: string;
  application_status: ApplicationStatus;
  skills_required: string;
  remarks: string;
  created_at: string;
}

export type InternshipInput = Omit<Internship, 'id' | 'created_at'>;
