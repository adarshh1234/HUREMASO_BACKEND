import { LetterTemplateModel, HrCommunicationModel, IssuedLetterModel } from './hrLetter.model';
import {
  ILetterTemplate,
  IHrCommunication,
  IIssuedLetter,
  CommunicationQueryParams,
  HRLetterStatsSummary,
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
          body: 'Dear {{employeeName}},\n\nWe are excited to offer you the position of {{jobTitle}} with {{companyName}}. We were very impressed by your skills and experience and believe you will be a valuable addition to our team.\n\nYour compensation and benefits details are attached with this official offer letter. We look forward to welcoming you aboard.',
          message: 'Dear [Employee Name],\n\nWe are excited to offer you the position of [Job Title] with [Company Name]. We were very impressed by your skills and experience and believe you will be a valuable addition to our team...',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '{{employeeName}}', '{{companyName}}', '{{jobTitle}}'],
          isActive: true,
        },
        {
          name: 'Relieving Letter',
          category: 'Relieving' as const,
          type: 'letters' as const,
          subject: 'Relieving Letter – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nThis is in reference to your resignation letter dated {{resignationDate}}. We would like to inform you that you are relieved from your services as {{jobTitle}} at the close of business hours on {{relievingDate}}.\n\nWe confirm that you have completed all handover responsibilities and your full and final settlement has been processed satisfactorily.',
          message: 'Dear [Employee Name],\n\nThis is in reference to your resignation letter dated [Resignation Date]. We would like to inform you that you are relieved from your services as [Job Title] at the close of business hours on [Relieving Date]...',
          variables: ['[Employee Name]', '[Job Title]', '[Resignation Date]', '[Relieving Date]', '{{employeeName}}', '{{jobTitle}}', '{{resignationDate}}', '{{relievingDate}}'],
          isActive: true,
        },
        {
          name: 'Experience Certificate',
          category: 'Experience' as const,
          type: 'letters' as const,
          subject: 'Experience Certificate – {{employeeName}}',
          body: 'To Whom It May Concern,\n\nThis is to certify that {{employeeName}} was employed with {{companyName}} as a {{jobTitle}} from {{startDate}} to {{endDate}}. During their tenure with us, we found them to be hard-working, honest, and dedicated to their duties.\n\nWe wish them all the best in their future career endeavors.',
          message: 'To Whom It May Concern,\n\nThis is to certify that [Employee Name] was employed with [Company Name] as a [Job Title] from [Start Date] to [End Date]. During their tenure with us, we found them to be hard-working, honest, and dedicated to their duties...',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '[Start Date]', '[End Date]', '{{employeeName}}', '{{companyName}}', '{{jobTitle}}', '{{startDate}}', '{{endDate}}'],
          isActive: true,
        },
        {
          name: 'Warning Letter',
          category: 'Warning' as const,
          type: 'letters' as const,
          subject: 'Formal Warning Notice – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nThis letter serves as an official written warning regarding non-compliance with company policy. Continued failure to meet organizational expectations may lead to further disciplinary action up to and including termination of employment.\n\nPlease discuss your remediation plan with your reporting manager within 5 business days.',
          message: 'Dear [Employee Name],\n\nThis letter serves as an official written warning regarding non-compliance with company policy...',
          variables: ['[Employee Name]', '[Company Name]', '{{employeeName}}'],
          isActive: true,
        },
        {
          name: 'Promotion Letter',
          category: 'Promotion' as const,
          type: 'letters' as const,
          subject: 'Promotion & Title Revision – {{employeeName}}',
          body: 'Dear {{employeeName}},\n\nIn recognition of your exceptional contributions and dedication to {{companyName}}, the management is delighted to promote you to {{jobTitle}}, effective from {{joiningDate}}.\n\nCongratulations on this well-deserved milestone in your career journey with us!',
          message: 'Dear [Employee Name],\n\nIn recognition of your exceptional contributions...',
          variables: ['[Employee Name]', '[Company Name]', '[Job Title]', '{{employeeName}}', '{{jobTitle}}'],
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

    if (params.priority && params.priority !== 'all') {
      filter.priority = params.priority;
    }

    if (params.department && params.department !== 'all') {
      filter.$or = [
        { department: new RegExp(params.department, 'i') },
        { dept: new RegExp(params.department, 'i') },
        { targetAudience: new RegExp(params.department, 'i') },
      ];
    }

    if (params.search && params.search.trim() !== '') {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      const searchCondition = [
        { referenceNumber: searchRegex },
        { title: searchRegex },
        { subject: searchRegex },
        { content: searchRegex },
        { author: searchRegex },
        { createdBy: searchRegex },
        { department: searchRegex },
        { recipient: searchRegex },
        { employeeId: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
        delete filter.$or;
      } else {
        filter.$or = searchCondition;
      }
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder === 'asc' ? 1 : -1;

    let query = HrCommunicationModel.find(filter).sort({ [sortField]: sortDir });

    if (params.page && params.limit) {
      const pageNum = Number(params.page);
      const limitNum = Number(params.limit);
      if (pageNum > 0 && limitNum > 0) {
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
      }
    }

    const comms = await query.exec();

    if (comms.length === 0 && Object.keys(filter).length === 0) {
      const sample = [
        {
          referenceNumber: 'MEMO-2026-0041',
          type: 'memo' as const,
          title: 'Q3 Hybrid Work & Office Policy Update',
          subject: 'Q3 Hybrid Work & Office Policy Update',
          content: 'Official corporate guidelines regarding hybrid working arrangements for Q3. All departments are required to schedule minimum 3 office days per week.',
          author: 'HR Director',
          createdBy: 'HR Director',
          department: 'Engineering',
          dept: 'Engineering',
          targetAudience: 'Engineering Staff',
          priority: 'High' as const,
          status: 'Published' as const,
          effectiveDate: '2026-09-01',
          issuedDate: 'August 25, 2026',
          date: 'August 25, 2026',
        },
        {
          referenceNumber: 'MEMO-2026-0042',
          type: 'memo' as const,
          title: 'Security Pass & Visitor Access Protocol',
          subject: 'Security Pass & Visitor Access Protocol',
          content: 'Updated biometric badges and security access protocols for office entry across all corporate technology parks.',
          author: 'IT Operations',
          createdBy: 'IT Operations',
          department: 'Operations',
          dept: 'Operations',
          targetAudience: 'All Employees',
          priority: 'Medium' as const,
          status: 'Published' as const,
          effectiveDate: '2026-09-05',
          issuedDate: 'August 10, 2026',
          date: 'August 10, 2026',
        },
        {
          referenceNumber: 'NOT-2026-0102',
          type: 'notice' as const,
          title: 'Labor Day Public Holiday Announcement',
          subject: 'Labor Day Public Holiday Announcement',
          content: 'Office holiday schedule and emergency contacts for the upcoming official Labor Day public holiday.',
          author: 'HR Operations',
          createdBy: 'HR Operations',
          department: 'General',
          dept: 'General',
          targetAudience: 'All Staff',
          priority: 'Low' as const,
          status: 'Published' as const,
          effectiveDate: '2026-09-07',
          issuedDate: 'August 28, 2026',
          date: 'August 28, 2026',
        },
        {
          referenceNumber: 'CIR-2026-0089',
          type: 'circular' as const,
          title: 'Q4 Engineering Code Sprint & Hackathon',
          subject: 'Q4 Engineering Code Sprint & Hackathon',
          content: 'Registration procedures, judging criteria and timeline for the upcoming annual Engineering Innovation Hackathon.',
          author: 'CTO Office',
          createdBy: 'CTO Office',
          department: 'Engineering',
          dept: 'Engineering',
          targetAudience: 'Engineering Staff',
          priority: 'Medium' as const,
          status: 'Published' as const,
          effectiveDate: '2026-10-15',
          issuedDate: 'August 22, 2026',
          date: 'August 22, 2026',
        },
        {
          referenceNumber: 'LTR-2026-0012',
          type: 'letters' as const,
          title: 'Experience & Conduct Certificate',
          subject: 'Experience Certificate – Sarah Johnson',
          content: 'This is to certify Sarah Johnson was employed as a Senior Full Stack Engineer with outstanding contributions and high professional integrity.',
          author: 'HR Management',
          createdBy: 'HR Management',
          department: 'Software Engineering',
          dept: 'Software Engineering',
          recipient: 'Sarah Johnson',
          employeeTarget: 'EMP2024001',
          employeeId: 'EMP2024001',
          priority: 'Medium' as const,
          status: 'Completed' as const,
          effectiveDate: '2026-08-26',
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
          referenceNumber: 'LTR-2026-0012',
          employeeId: 'EMP2024001',
          employeeName: 'Sarah Johnson',
          designation: 'Senior Full Stack Engineer',
          department: 'Software Engineering',
          letterType: 'Experience & Conduct Certificate',
          subject: 'Experience Certificate – Sarah Johnson',
          content: 'This is to certify Sarah Johnson was employed as a Senior Full Stack Engineer with outstanding contributions and high professional integrity.',
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

  // ==========================================
  // STATS & COUNTS SUMMARY
  // ==========================================
  async getCountsSummary(): Promise<HRLetterStatsSummary> {
    const [
      memos,
      notices,
      circulars,
      commLetters,
      issuedRecords,
      commDrafts,
      recordDrafts,
      commPublished,
      recordPublished,
      archived,
    ] = await Promise.all([
      HrCommunicationModel.countDocuments({ type: 'memo' }),
      HrCommunicationModel.countDocuments({ type: 'notice' }),
      HrCommunicationModel.countDocuments({ type: 'circular' }),
      HrCommunicationModel.countDocuments({ type: { $in: ['letter', 'letters'] } }),
      IssuedLetterModel.countDocuments({}),
      HrCommunicationModel.countDocuments({ status: 'Draft' }),
      IssuedLetterModel.countDocuments({ status: 'Draft' }),
      HrCommunicationModel.countDocuments({ status: { $in: ['Published', 'Active'] } }),
      IssuedLetterModel.countDocuments({ status: { $in: ['Issued', 'Published', 'Signed'] } }),
      HrCommunicationModel.countDocuments({ status: 'Archived' }),
    ]);

    const totalLetters = commLetters + issuedRecords;
    const drafts = commDrafts + recordDrafts;
    const published = commPublished + recordPublished;
    const total = memos + notices + circulars + totalLetters;

    return {
      total,
      memos,
      notices,
      circulars,
      letters: totalLetters,
      drafts,
      published,
      archived,
    };
  }
}

export const hrLetterRepository = new HrLetterRepository();
