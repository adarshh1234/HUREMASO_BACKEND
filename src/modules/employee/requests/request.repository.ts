import { EmployeeRequestModel } from './request.model';
import { IEmployeeRequest } from './request.types';

export class EmployeeRequestRepository {
  async create(data: Partial<IEmployeeRequest>): Promise<IEmployeeRequest> {
    const req = new EmployeeRequestModel(data);
    return await req.save();
  }

  async findById(id: string): Promise<IEmployeeRequest | null> {
    return await EmployeeRequestModel.findById(id);
  }

  async findAll(filter: any = {}): Promise<IEmployeeRequest[]> {
    return await EmployeeRequestModel.find(filter).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IEmployeeRequest>): Promise<IEmployeeRequest | null> {
    return await EmployeeRequestModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const res = await EmployeeRequestModel.findByIdAndDelete(id);
    return !!res;
  }
}

export const employeeRequestRepository = new EmployeeRequestRepository();
