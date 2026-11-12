import { employeeConfigRepository, EmployeeConfigRepository } from './employeeConfig.repository';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import { IEmployeeConfig, IOptionalFields } from './employeeConfig.types';

export class EmployeeConfigService {
  constructor(private repo: EmployeeConfigRepository = employeeConfigRepository) {}

  async getConfig(): Promise<IEmployeeConfig> {
    return await this.repo.getConfig();
  }

  async updateOptionalFields(fields: Partial<IOptionalFields>): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    const updated = {
      ...current.optionalFields,
      ...fields,
    };
    current.optionalFields = updated;
    return await current.save();
  }

  async addCustomField(field: { name: string; screen?: string; type?: string }): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    if (current.customFields.some((f) => f.name.toLowerCase() === field.name.toLowerCase())) {
      throw AppError.badRequest('Custom field already exists');
    }
    if (current.customFields.length >= 10) {
      throw AppError.badRequest('Maximum 10 custom fields allowed');
    }
    current.customFields.push({
      name: field.name,
      screen: field.screen || 'Personal Details',
      type: field.type || 'Text or Number',
    });
    return await current.save();
  }

  async deleteCustomField(name: string): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    current.customFields = current.customFields.filter((f) => f.name.toLowerCase() !== name.toLowerCase());
    return await current.save();
  }

  async addReportingMethod(name: string): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    if (current.reportingMethods.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
      throw AppError.badRequest('Reporting method already exists');
    }
    current.reportingMethods.push({ name });
    return await current.save();
  }

  async deleteReportingMethod(name: string): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    current.reportingMethods = current.reportingMethods.filter((m) => m.name.toLowerCase() !== name.toLowerCase());
    return await current.save();
  }

  async addTerminationReason(name: string): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    if (current.terminationReasons.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      throw AppError.badRequest('Termination reason already exists');
    }
    current.terminationReasons.push({ name });
    return await current.save();
  }

  async deleteTerminationReason(name: string): Promise<IEmployeeConfig> {
    const current = await this.repo.getConfig();
    current.terminationReasons = current.terminationReasons.filter((r) => r.name.toLowerCase() !== name.toLowerCase());
    return await current.save();
  }

  async importEmployees(records: Array<{
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    jobTitle?: string;
    location?: string;
    gender?: string;
    dob?: string;
  }>): Promise<{ importedCount: number; errors: string[] }> {
    let importedCount = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        const existing = await EmployeeModel.findOne({ email: record.email.toLowerCase() });
        if (existing) {
          errors.push(`Employee with email ${record.email} already exists`);
          continue;
        }

        const count = await EmployeeModel.countDocuments();
        const employeeId = `EMP${String(100000 + count + 1)}`;
        const name = `${record.firstName} ${record.lastName}`.trim();

        await EmployeeModel.create({
          employeeId,
          firstName: record.firstName,
          lastName: record.lastName,
          name,
          email: record.email.toLowerCase(),
          department: record.department || 'Software',
          jobTitle: record.jobTitle || 'Engineering',
          location: record.location || 'Kochi',
          gender: record.gender || 'Female',
          dob: record.dob || '',
        });
        importedCount++;
      } catch (err: any) {
        errors.push(`Error importing ${record.email}: ${err.message}`);
      }
    }

    return { importedCount, errors };
  }
}

export const employeeConfigService = new EmployeeConfigService();
