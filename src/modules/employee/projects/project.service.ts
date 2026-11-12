import { projectRepository, ProjectRepository } from './project.repository';
import { CustomerModel } from './project.model';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import { ICustomer, IProjectRecord } from './project.types';

export class ProjectService {
  constructor(private repo: ProjectRepository = projectRepository) {}

  // Customers
  async getCustomers(): Promise<ICustomer[]> {
    return await this.repo.getCustomers();
  }

  async createCustomer(data: { name: string; desc?: string }): Promise<ICustomer> {
    const existing = await CustomerModel.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) {
      throw AppError.badRequest('Customer already exists');
    }
    return await this.repo.createCustomer({ name: data.name, desc: data.desc || '-' });
  }

  async updateCustomer(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
    const updated = await this.repo.updateCustomer(id, data);
    if (!updated) throw AppError.notFound('Customer not found');
    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    const deleted = await this.repo.deleteCustomer(id);
    if (!deleted) throw AppError.notFound('Customer not found');
  }

  // Projects
  async getProjects(filter: {
    customerName?: string;
    project?: string;
    projectAdmins?: string;
  }): Promise<IProjectRecord[]> {
    const query: any = {};
    if (filter.customerName) {
      query.customerName = { $regex: filter.customerName, $options: 'i' };
    }
    if (filter.project) {
      query.project = { $regex: filter.project, $options: 'i' };
    }
    if (filter.projectAdmins) {
      query.projectAdmins = { $regex: filter.projectAdmins, $options: 'i' };
    }
    return await this.repo.getProjects(query);
  }

  async createProject(data: {
    customerName: string;
    project: string;
    projectAdmins?: string;
    status?: string;
  }): Promise<IProjectRecord> {
    const customer = await CustomerModel.findOne({ name: new RegExp(`^${data.customerName}$`, 'i') });
    return await this.repo.createProject({
      customerName: data.customerName,
      customerId: customer?._id,
      project: data.project,
      projectAdmins: data.projectAdmins || '-',
      status: data.status || 'Active',
    });
  }

  async updateProject(id: string, data: Partial<IProjectRecord>): Promise<IProjectRecord> {
    const updated = await this.repo.updateProject(id, data);
    if (!updated) throw AppError.notFound('Project record not found');
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    const deleted = await this.repo.deleteProject(id);
    if (!deleted) throw AppError.notFound('Project record not found');
  }
}

export const projectService = new ProjectService();
