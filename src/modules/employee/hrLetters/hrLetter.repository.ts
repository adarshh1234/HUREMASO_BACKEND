import { LetterTemplateModel, HrCommunicationModel, IssuedLetterModel } from './hrLetter.model';
import {
  ILetterTemplate,
  IHrCommunication,
  IIssuedLetter,
  CommunicationQueryParams,
} from './hrLetter.types';

export class HrLetterRepository {
  // ==========================================
  // TEMPLATES
  // ==========================================
  async getTemplates(filter: any = {}): Promise<ILetterTemplate[]> {
    const templates = await LetterTemplateModel.find(filter).sort({ createdAt: 1 });
    if (templates.length === 0 && Object.keys(filter).length === 0) {
      const defaultTemplates = [
        {
          name: 'Employment Confirmation Letter',
          category: 'Confirmation' as const,
          type: 'letters' as const,
          subject: 'Employment Confirmation – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nWe are pleased to confirm your employment with {{companyName}} as a {{jobTitle}}, effective from {{joiningDate}}.\n\nYour performance during the probation period has been found satisfactory, and we look forward to your continued contribution to the organization. All terms and conditions of your employment remain unchanged.\n\nPlease feel free to reach out to HR for any further clarification.',
          message: 'Dear [Employee Name],\n\nWe are pleased to confirm your employment with [Company Name] as a [Job Title], effective from [Joining Date].\n\nYour performance during the probation period has been found satisfactory, and we look forward to your continued contribution to the organization. All terms and conditions of your employment remain unchanged.\n\nPlease feel free to reach out to HR for any further clarification.',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '[Joining Date]', '{{employeeName}}', '{{companyName}}', '{{jobTitle}}', '{{joiningDate}}'],
          isActive: true,
        },
        {
          name: 'Offer Letter',
          category: 'Offer' as const,
          type: 'letters' as const,
          subject: 'Job Offer – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nWe are excited to offer you the position of {{jobTitle}} with {{companyName}}. We were very impressed by your skills and experience and believe you will be a valuable addition to our team...',
          message: 'Dear [Employee Name],\n\nWe are excited to offer you the position of [Job Title] with [Company Name]. We were very impressed by your skills and experience and believe you will be a valuable addition to our team...',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '{{employeeName}}', '{{companyName}}', '{{jobTitle}}'],
          isActive: true,
        },
        {
          name: 'Relieving Letter',
          category: 'Relieving' as const,
          type: 'letters' as const,
          subject: 'Relieving Letter – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nThis is in reference to your resignation letter dated {{resignationDate}}. We would like to inform you that you are relieved from your services as {{jobTitle}} at the close of business hours on {{relievingDate}}...',
          message: 'Dear [Employee Name],\n\nThis is in reference to your resignation letter dated [Resignation Date]. We would like to inform you that you are relieved from your services as [Job Title] at the close of business hours on [Relieving Date]...',
          variables: ['[Employee Name]', '[Job Title]', '[Resignation Date]', '[Relieving Date]', '{{employeeName}}', '{{jobTitle}}', '{{resignationDate}}', '{{relievingDate}}'],
          isActive: true,
        },
        {
          name: 'Experience Certificate',
          category: 'Experience' as const,
          type: 'letters' as const,
          subject: 'Experience Certificate – {{employeeName}}',
          body: 'To Whom It May Concern,\n\nThis is to certify that {{employeeName}} was employed with {{companyName}} as a {{jobTitle}} from {{startDate}} to {{endDate}}. During their tenure with us, we found them to be hard-working, honest, and dedicated to their duties...',
          message: 'To Whom It May Concern,\n\nThis is to certify that [Employee Name] was employed with [Company Name] as a [Job Title] from [Start Date] to [End Date]. During their tenure with us, we found them to be hard-working, honest, and dedicated to their duties...',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '[Start Date]', '[End Date]', '{{employeeName}}', '{{companyName}}', '{{jobTitle}}', '{{startDate}}', '{{endDate}}'],
          isActive: true,
        },
      ];
      return (await LetterTemplateModel.insertMany(defaultTemplates)) as unknown as ILetterTemplate[];
    }
    return templates;
  }

  async findTemplateById(id: string): Promise<ILetterTemplate | null> {
    return await LetterTemplateModel.findById(id);
  }

  async createTemplate(data: Partial<ILetterTemplate>): Promise<ILetterTemplate> {
    const template = new LetterTemplateModel(data);
    return await template.save();
  }

  async updateTemplate(id: string, data: Partial<ILetterTemplate>): Promise<ILetterTemplate | null> {
    return await LetterTemplateModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const res = await LetterTemplateModel.findByIdAndDelete(id);
    return !!res;
  }

  // ==========================================
  // COMMUNICATIONS (MEMOS, NOTICES, CIRCULARS, LETTERS)
  // ==========================================
  async getCommunications(params: CommunicationQueryParams = {}): Promise<IHrCommunication[]> {
    const filter: any = {};

    if (params.type && params.type !== 'all') {
      if (params.type === 'letter' || params.type === 'letters') {
        filter.type = { $in: ['letter', 'letters'] };
      } else {
        filter.type = params.type;
      }
    }

    if (params.status && params.status !== 'all') {
      filter.status = params.status;
    }

    if (params.department && params.department !== 'all') {
      filter.$or = [
        { department: new RegExp(params.department, 'i') },
        { dept: new RegExp(params.department, 'i') },
        { targetAudience: new RegExp(params.department, 'i') },
      ];
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { author: searchRegex },
        { createdBy: searchRegex },
        { department: searchRegex },
        { recipient: searchRegex },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder === 'asc' ? 1 : -1;

    const comms = await HrCommunicationModel.find(filter).sort({ [sortField]: sortDir });

    if (comms.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        {
          type: 'memo' as const,
          title: 'Q3 Hybrid Work & Office Policy Update',
          content: 'Official guidelines and policies regarding hybrid working arrangements for Q3.',
          author: 'HR Director',
          createdBy: 'HR Director',
          department: 'All Departments',
          dept: 'All Departments',
          targetAudience: 'All Staff',
          status: 'Published' as const,
          issuedDate: 'August 25, 2026',
          date: 'August 25, 2026',
        },
        {
          type: 'memo' as const,
          title: 'Security Pass & Visitor Access Protocol',
          content: 'Updated biometric badges and security access protocols for office entry.',
          author: 'IT Operations',
          createdBy: 'IT Operations',
          department: 'Operations',
          dept: 'Operations',
          targetAudience: 'All Employees',
          status: 'Published' as const,
          issuedDate: 'August 10, 2026',
          date: 'August 10, 2026',
        },
        {
          type: 'notice' as const,
          title: 'Labor Day Public Holiday Announcement',
          content: 'Office holiday schedule and emergency contacts for the upcoming Labor Day.',
          author: 'HR Operations',
          createdBy: 'HR Operations',
          department: 'General',
          dept: 'General',
          targetAudience: 'All Staff',
          status: 'Active' as const,
          issuedDate: 'August 28, 2026',
          date: 'August 28, 2026',
        },
        {
          type: 'circular' as const,
          title: 'Q4 Engineering Code Sprint & Hackathon',
          content: 'Registration and guidelines for the upcoming annual Engineering Hackathon.',
          author: 'CTO Office',
          createdBy: 'CTO Office',
          department: 'Engineering',
          dept: 'Engineering',
          targetAudience: 'Engineering Staff',
          status: 'Published' as const,
          issuedDate: 'August 22, 2026',
          date: 'August 22, 2026',
        },
        {
          type: 'letters' as const,
          title: 'Experience & Conduct Certificate',
          content: 'This is to certify Sarah Johnson was employed as a Senior Engineer with excellent conduct.',
          author: 'HR Management',
          createdBy: 'HR Management',
          department: 'Software Engineering',
          dept: 'Software Engineering',
          recipient: 'Sarah Johnson',
          employeeTarget: 'EMP2024001',
          employeeId: 'EMP2024001',
          status: 'Completed' as const,
          issuedDate: 'August 26, 2026',
          date: 'August 26, 2026',
        },
      ];
      return (await HrCommunicationModel.insertMany(sample)) as unknown as IHrCommunication[];
    }

    return comms;
  }

  async findCommunicationById(id: string): Promise<IHrCommunication | null> {
    return await HrCommunicationModel.findById(id);
  }

  async createCommunication(data: Partial<IHrCommunication>): Promise<IHrCommunication> {
    const comm = new HrCommunicationModel(data);
    return await comm.save();
  }

  async updateCommunication(id: string, data: Partial<IHrCommunication>): Promise<IHrCommunication | null> {
    return await HrCommunicationModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCommunication(id: string): Promise<boolean> {
    const res = await HrCommunicationModel.findByIdAndDelete(id);
    return !!res;
  }

  // ==========================================
  // ISSUED LETTERS / RECORDS
  // ==========================================
  async getIssuedLetters(filter: any = {}): Promise<IIssuedLetter[]> {
    const records = await IssuedLetterModel.find(filter).sort({ createdAt: -1 });
    if (records.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        {
          employeeId: 'EMP2024001',
          letterType: 'Experience & Conduct Certificate',
          subject: 'Experience Certificate – Sarah Johnson',
          content: 'This is to certify Sarah Johnson was employed as a Senior Full Stack Engineer with outstanding contributions.',
          issuedDate: new Date().toISOString().split('T')[0],
          issuedBy: 'HR Management',
          createdBy: 'HR Management',
          status: 'Issued' as const,
        },
      ];
      return (await IssuedLetterModel.insertMany(sample)) as unknown as IIssuedLetter[];
    }
    return records;
  }

  async findIssuedLetterById(id: string): Promise<IIssuedLetter | null> {
    return await IssuedLetterModel.findById(id);
  }

  async createIssuedLetter(data: Partial<IIssuedLetter>): Promise<IIssuedLetter> {
    const record = new IssuedLetterModel(data);
    return await record.save();
  }

  async updateIssuedLetter(id: string, data: Partial<IIssuedLetter>): Promise<IIssuedLetter | null> {
    return await IssuedLetterModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteIssuedLetter(id: string): Promise<boolean> {
    const res = await IssuedLetterModel.findByIdAndDelete(id);
    return !!res;
  }
}

export const hrLetterRepository = new HrLetterRepository();
