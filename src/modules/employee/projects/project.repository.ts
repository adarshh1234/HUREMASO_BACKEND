import { CustomerModel, ProjectRecordModel } from './project.model';
import { ICustomer, IProjectRecord } from './project.types';

export class ProjectRepository {
  // Customers
  async getCustomers(): Promise<ICustomer[]> {
    const customers = await CustomerModel.find().sort({ createdAt: -1 });
    if (customers.length === 0) {
      const sample = [
        { name: 'Acme Corp', desc: 'Leading apparel manufacturing chain' },
        { name: 'Globex Corporation', desc: 'International logistics and supply' },
      ];
      return await CustomerModel.insertMany(sample);
    }
    return customers;
  }

  async createCustomer(data: Partial<ICustomer>): Promise<ICustomer> {
    const customer = new CustomerModel(data);
    return await customer.save();
  }

  async updateCustomer(id: string, data: Partial<ICustomer>): Promise<ICustomer | null> {
    return await CustomerModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const res = await CustomerModel.findByIdAndDelete(id);
    return !!res;
  }

  // Projects
  async getProjects(filter: any = {}): Promise<IProjectRecord[]> {
    const projects = await ProjectRecordModel.find(filter).sort({ createdAt: -1 });
    if (projects.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        { customerName: 'Acme Corp', project: 'ACME Portal Modernization', projectAdmins: 'Sarah Johnson' },
        { customerName: 'Globex Corporation', project: 'Globex Cloud ERP', projectAdmins: 'Michael Chen' },
      ];
      return await ProjectRecordModel.insertMany(sample);
    }
    return projects;
  }

  async createProject(data: Partial<IProjectRecord>): Promise<IProjectRecord> {
    const project = new ProjectRecordModel(data);
    return await project.save();
  }

  async findProjectById(id: string): Promise<IProjectRecord | null> {
    return await ProjectRecordModel.findById(id);
  }

  async updateProject(id: string, data: Partial<IProjectRecord>): Promise<IProjectRecord | null> {
    return await ProjectRecordModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProject(id: string): Promise<boolean> {
    const res = await ProjectRecordModel.findByIdAndDelete(id);
    return !!res;
  }
}

export const projectRepository = new ProjectRepository();
