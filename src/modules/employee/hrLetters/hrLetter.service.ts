import mongoose from 'mongoose';
import { hrLetterRepository, HrLetterRepository } from './hrLetter.repository';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import {
  ILetterTemplate,
  IHrCommunication,
  IIssuedLetter,
  CommunicationType,
  CommunicationStatus,
  CommunicationQueryParams,
  CreateCommunicationDTO,
  UpdateCommunicationDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  CreateIssuedLetterDTO,
  UpdateIssuedLetterDTO,
  GenerateLetterDTO,
} from './hrLetter.types';

export class HrLetterService {
  constructor(private repo: HrLetterRepository = hrLetterRepository) {}

  // ==========================================
  // TEMPLATES
  // ==========================================
  async getTemplates(params?: { category?: string; type?: string }): Promise<ILetterTemplate[]> {
    const filter: any = {};
    if (params?.category) filter.category = params.category;
    if (params?.type) filter.type = params.type;
    return await this.repo.getTemplates(filter);
  }

  async getTemplateById(id: string): Promise<ILetterTemplate> {
    const template = await this.repo.findTemplateById(id);
    if (!template) throw AppError.notFound('Letter template not found');
    return template;
  }

  async createTemplate(data: CreateTemplateDTO): Promise<ILetterTemplate> {
    const bodyContent = data.body || data.message || '';
    const messageContent = data.message || data.body || '';
    return await this.repo.createTemplate({
      ...data,
      body: bodyContent,
      message: messageContent,
    });
  }

  async updateTemplate(id: string, data: UpdateTemplateDTO): Promise<ILetterTemplate> {
    const existing = await this.repo.findTemplateById(id);
    if (!existing) throw AppError.notFound('Letter template not found');

    const updatePayload: any = { ...data };
    if (data.body && !data.message) updatePayload.message = data.body;
    if (data.message && !data.body) updatePayload.body = data.message;

    const updated = await this.repo.updateTemplate(id, updatePayload);
    if (!updated) throw AppError.notFound('Letter template not found');
    return updated;
  }

  async deleteTemplate(id: string): Promise<void> {
    const deleted = await this.repo.deleteTemplate(id);
    if (!deleted) throw AppError.notFound('Letter template not found');
  }

  // ==========================================
  // COMMUNICATIONS (MEMO, NOTICE, CIRCULAR, LETTER/NOTE)
  // ==========================================
  async getCommunications(params: CommunicationQueryParams = {}): Promise<IHrCommunication[]> {
    return await this.repo.getCommunications(params);
  }

  async getCommunicationById(id: string): Promise<IHrCommunication> {
    const comm = await this.repo.findCommunicationById(id);
    if (!comm) throw AppError.notFound('Communication record not found');
    return comm;
  }

  async createCommunication(data: CreateCommunicationDTO): Promise<IHrCommunication> {
    const dept = data.department || data.dept || '';
    const author = data.author || data.createdBy || 'HR Management';
    const date = data.date || data.issuedDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const issuedDate = data.issuedDate || new Date().toISOString().split('T')[0];

    return await this.repo.createCommunication({
      ...data,
      department: dept,
      dept: dept,
      author: author,
      createdBy: author,
      date: date,
      issuedDate: issuedDate,
      status: data.status || 'Published',
    });
  }

  async updateCommunication(id: string, data: UpdateCommunicationDTO): Promise<IHrCommunication> {
    const existing = await this.repo.findCommunicationById(id);
    if (!existing) throw AppError.notFound('Communication record not found');

    const updatePayload: any = { ...data };
    if (data.department && !data.dept) updatePayload.dept = data.department;
    if (data.dept && !data.department) updatePayload.department = data.dept;
    if (data.author && !data.createdBy) updatePayload.createdBy = data.author;
    if (data.createdBy && !data.author) updatePayload.author = data.createdBy;
    if (data.date && !data.issuedDate) updatePayload.issuedDate = data.date;
    if (data.issuedDate && !data.date) updatePayload.date = data.issuedDate;

    const updated = await this.repo.updateCommunication(id, updatePayload);
    if (!updated) throw AppError.notFound('Communication record not found');
    return updated;
  }

  async updateCommunicationStatus(id: string, status: CommunicationStatus): Promise<IHrCommunication> {
    const updated = await this.repo.updateCommunication(id, { status });
    if (!updated) throw AppError.notFound('Communication record not found');
    return updated;
  }

  async deleteCommunication(id: string): Promise<void> {
    const deleted = await this.repo.deleteCommunication(id);
    if (!deleted) throw AppError.notFound('Communication record not found');
  }

  // ==========================================
  // ISSUED LETTERS / RECORDS
  // ==========================================
  async getIssuedLetters(params?: { employeeId?: string; status?: string }): Promise<IIssuedLetter[]> {
    const filter: any = {};
    if (params?.employeeId) filter.employeeId = params.employeeId;
    if (params?.status && params.status !== 'all') filter.status = params.status;
    return await this.repo.getIssuedLetters(filter);
  }

  async getIssuedLetterById(id: string): Promise<IIssuedLetter> {
    const record = await this.repo.findIssuedLetterById(id);
    if (!record) throw AppError.notFound('Issued letter record not found');
    return record;
  }

  async createIssuedLetter(data: CreateIssuedLetterDTO): Promise<IIssuedLetter> {
    const issuedBy = data.issuedBy || data.createdBy || 'HR Management';
    return await this.repo.createIssuedLetter({
      ...data,
      issuedBy,
      createdBy: issuedBy,
      issuedDate: data.issuedDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Issued',
    });
  }

  async updateIssuedLetter(id: string, data: UpdateIssuedLetterDTO): Promise<IIssuedLetter> {
    const existing = await this.repo.findIssuedLetterById(id);
    if (!existing) throw AppError.notFound('Issued letter record not found');

    const updated = await this.repo.updateIssuedLetter(id, data);
    if (!updated) throw AppError.notFound('Issued letter record not found');
    return updated;
  }

  async deleteIssuedLetter(id: string): Promise<void> {
    const deleted = await this.repo.deleteIssuedLetter(id);
    if (!deleted) throw AppError.notFound('Issued letter record not found');
  }

  // ==========================================
  // LETTER GENERATION LOGIC
  // ==========================================
  async generateLetter(payload: GenerateLetterDTO): Promise<{
    subject: string;
    message: string;
    bestRegards: string;
    content: string;
    record?: IIssuedLetter;
  }> {
    let template: ILetterTemplate | null = null;

    if (payload.templateId) {
      template = await this.repo.findTemplateById(payload.templateId);
    }
    if (!template && payload.templateName) {
      const templates = await this.repo.getTemplates();
      template = templates.find((t) => t.name.toLowerCase() === payload.templateName?.toLowerCase()) || null;
    }
    if (!template && payload.letterType) {
      const templates = await this.repo.getTemplates();
      template =
        templates.find((t) => t.name.toLowerCase().includes(payload.letterType!.toLowerCase())) ||
        templates.find((t) => t.category?.toLowerCase() === payload.letterType?.toLowerCase()) ||
        null;
    }
    if (!template) {
      const templates = await this.repo.getTemplates();
      template = templates[0] || null;
    }
    if (!template) {
      throw AppError.notFound('No letter template available');
    }

    let employee = null;
    if (payload.employeeId) {
      const isOid = mongoose.Types.ObjectId.isValid(payload.employeeId);
      employee = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: payload.employeeId }, { _id: payload.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: payload.employeeId });
    }
    if (!employee && payload.employeeName) {
      employee = await EmployeeModel.findOne({ name: payload.employeeName });
    }

    const empName = String(employee ? employee.name : payload.employeeName || 'John Doe');
    const jobTitle = String(employee ? employee.jobTitle : 'Software Engineer');
    const compName = String(payload.companyName || 'Acme Corp');
    const joiningDate = String(employee ? 'January 15, 2024' : 'Recent');
    const dateNow = String(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const employeeIdStr = String(employee ? employee.employeeId : payload.employeeId || 'EMP2024001');

    let templateSubject = payload.subject || template.subject;
    let templateBody = template.body || template.message || '';

    // Replace standard variables in subject and body
    const replacements: Record<string, string> = {
      '\\[Employee Name\\]': empName,
      '\\{\\{employeeName\\}\\}': empName,
      '\\[Company Name\\]': compName,
      '\\{\\{companyName\\}\\}': compName,
      '\\[Job Title\\]': jobTitle,
      '\\{\\{jobTitle\\}\\}': jobTitle,
      '\\[Joining Date\\]': joiningDate,
      '\\{\\{joiningDate\\}\\}': joiningDate,
      '\\[Start Date\\]': 'January 15, 2024',
      '\\{\\{startDate\\}\\}': 'January 15, 2024',
      '\\[End Date\\]': dateNow,
      '\\{\\{endDate\\}\\}': dateNow,
      '\\[Resignation Date\\]': 'August 01, 2026',
      '\\{\\{resignationDate\\}\\}': 'August 01, 2026',
      '\\[Relieving Date\\]': dateNow,
      '\\{\\{relievingDate\\}\\}': dateNow,
      '\\{\\{employeeId\\}\\}': employeeIdStr,
      '\\[Employee ID\\]': employeeIdStr,
    };

    if (payload.replacements) {
      for (const [k, v] of Object.entries(payload.replacements)) {
        replacements[`\\{\\{${k}\\}\\}`] = v;
        replacements[`\\[${k}\\]`] = v;
      }
    }

    for (const [pattern, val] of Object.entries(replacements)) {
      const regex = new RegExp(pattern, 'g');
      templateSubject = templateSubject.replace(regex, val);
      templateBody = templateBody.replace(regex, val);
    }

    const bestRegards = `Best regards,\nHuman Resources Department\n${compName}`;
    const fullContent = `${templateBody}\n\n${bestRegards}`;

    // Also persist as an issued letter record if generated for an employee
    let issuedRecord: IIssuedLetter | undefined;
    try {
      issuedRecord = await this.repo.createIssuedLetter({
        employeeId: employeeIdStr,
        templateId: template.id,
        letterType: template.name || payload.letterType || 'HR Letter',
        subject: templateSubject,
        content: fullContent,
        issuedDate: new Date().toISOString().split('T')[0],
        issuedBy: 'HR Operations',
        createdBy: 'HR Operations',
        status: 'Issued',
      });
    } catch {
      // Non-blocking fallback
    }

    return {
      subject: templateSubject,
      message: templateBody,
      bestRegards,
      content: fullContent,
      record: issuedRecord,
    };
  }
}

export const hrLetterService = new HrLetterService();
