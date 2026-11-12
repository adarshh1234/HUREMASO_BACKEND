import { EmployeeConfigModel } from './employeeConfig.model';
import { IEmployeeConfig } from './employeeConfig.types';

export class EmployeeConfigRepository {
  async getConfig(): Promise<IEmployeeConfig> {
    let config = await EmployeeConfigModel.findOne();
    if (!config) {
      config = await EmployeeConfigModel.create({
        optionalFields: { nickname: true, smoker: true, family: true, education: true },
        customFields: [
          { name: 'Address', screen: 'Personal Details', type: 'Text or Number' },
          { name: 'Blood Type', screen: 'Personal Details', type: 'Text or Number' },
          { name: 'custom', screen: 'Personal Details', type: 'Text or Number' },
          { name: 'Grades titles', screen: 'Personal Details', type: 'Text or Number' },
        ],
        reportingMethods: [{ name: 'Direct' }, { name: 'Indirect' }, { name: 'Test_Reporting' }],
        terminationReasons: [{ name: 'Resigned' }, { name: 'Contract Expired' }, { name: 'Performance' }],
      });
    }
    return config;
  }

  async saveConfig(data: Partial<IEmployeeConfig>): Promise<IEmployeeConfig> {
    return await EmployeeConfigModel.findOneAndUpdate({}, data, { upsert: true, new: true });
  }
}

export const employeeConfigRepository = new EmployeeConfigRepository();
