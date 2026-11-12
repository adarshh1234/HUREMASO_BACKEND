export interface IJobPosting {
  id?: string;
  _id?: string;
  vacancyId?: string;
  title: string;
  jobTitle?: string;
  department: string;
  locationType?: string;
  location?: string;
  officeLocation?: string;
  employmentType: string;
  minSalary?: number;
  maxSalary?: number;
  salaryRange?: string;
  currency?: string;
  experienceLevel?: string;
  skills?: string[];
  qualifications?: string;
  description: string;
  platform: 'LetsGetIn' | 'Internal' | 'Website' | string;
  status: 'Draft' | 'Published' | 'Live on Letgetin' | 'Closed';
  platformPostId?: string;
  liveUrl?: string;
  postedDate: string;
  postedAt?: Date;
  closingDate?: string;
  applicantsCount: number;
  isArchived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateJobPostingDTO {
  vacancyId?: string;
  title?: string;
  jobTitle?: string;
  department: string;
  locationType?: string;
  location?: string;
  officeLocation?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryRange?: string;
  currency?: string;
  experienceLevel?: string;
  skills?: string[];
  qualifications?: string;
  description?: string;
  platform?: string;
  status?: IJobPosting['status'];
  platformPostId?: string;
  liveUrl?: string;
  postedDate?: string;
  postedAt?: Date;
  closingDate?: string;
}

export interface UpdateJobPostingDTO extends Partial<CreateJobPostingDTO> {
  isArchived?: boolean;
  applicantsCount?: number;
}

export interface JobPostingQueryParams {
  search?: string;
  department?: string;
  platform?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
