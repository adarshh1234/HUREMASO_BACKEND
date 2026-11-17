export type VacancyStatus = 'Available' | 'Active' | 'Closed' | 'Draft';

export interface IVacancy {
  id?: string;
  _id?: string;
  jobTitle: string;
  title?: string;
  department: string;
  location?: string;
  locationType?: string;
  employmentType?: string;
  hiringManager: string;
  noOfOpenings: number;
  numberOfPositions?: number;
  numberOfOpenings?: number;
  openings?: number;
  description: string;
  jobDescription?: string;
  requirements?: string;
  status: VacancyStatus;
  datePosted: string;
  closingDate?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryRange?: string;
  currency?: string;
  experienceLevel?: string;
  experienceRequired?: string;
  requiredQualifications?: string;
  skills?: string[];
  skillsRequired?: string[];
  isArchived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVacancyDTO {
  jobTitle?: string;
  title?: string;
  department: string;
  location?: string;
  locationType?: string;
  employmentType?: string;
  hiringManager: string;
  noOfOpenings?: number;
  numberOfPositions?: number;
  description?: string;
  jobDescription?: string;
  requirements?: string;
  status?: VacancyStatus;
  datePosted?: string;
  closingDate?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryRange?: string;
  currency?: string;
  experienceLevel?: string;
  experienceRequired?: string;
  requiredQualifications?: string;
  skills?: string[];
  skillsRequired?: string[];
}

export interface UpdateVacancyDTO extends Partial<CreateVacancyDTO> {
  isArchived?: boolean;
}

export interface VacancyQueryParams {
  search?: string;
  jobTitle?: string;
  title?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  hiringManager?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
