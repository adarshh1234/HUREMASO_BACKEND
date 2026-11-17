import mongoose from 'mongoose';
import { hrLetterRepository, HrLetterRepository } from './hrLetter.repository';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import { aiProvider } from '../../ai/ai.engine';
import { generateHrDocumentPDF, PDFDocumentOptions } from './hrLetter.pdf';
import {
  ILetterTemplate,
  IHrCommunication,
  IIssuedLetter,
  CommunicationStatus,
  CommunicationQueryParams,
  CreateCommunicationDTO,
  UpdateCommunicationDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  CreateIssuedLetterDTO,
  UpdateIssuedLetterDTO,
  GenerateLetterDTO,
  AIDraftRequestDTO,
  AIDraftResponseDTO,
  HRLetterStatsSummary,
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
    const author = data.author || data.createdBy || 'HR Operations Team';
    const date =
      data.date ||
      data.issuedDate ||
      new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const issuedDate = data.issuedDate || new Date().toISOString().split('T')[0];
    const status = data.status || 'Published';

    return await this.repo.createCommunication({
      ...data,
      department: dept,
      dept: dept,
      author: author,
      createdBy: author,
      date: date,
      issuedDate: issuedDate,
      status: status,
      publishedAt: status === 'Published' ? new Date() : undefined,
      publishedBy: status === 'Published' ? author : undefined,
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

    if (data.status === 'Published' && existing.status !== 'Published') {
      updatePayload.publishedAt = new Date();
      updatePayload.publishedBy = data.author || existing.author || 'HR Management';
    }

    const updated = await this.repo.updateCommunication(id, updatePayload);
    if (!updated) throw AppError.notFound('Communication record not found');
    return updated;
  }

  async updateCommunicationStatus(
    id: string,
    status: CommunicationStatus,
    approvedBy?: string
  ): Promise<IHrCommunication> {
    const existing = await this.repo.findCommunicationById(id);
    if (!existing) throw AppError.notFound('Communication record not found');

    const updatePayload: any = { status };
    if (status === 'Approved') {
      updatePayload.approvedBy = approvedBy || 'HR Director';
      updatePayload.approvedAt = new Date();
    }
    if (status === 'Published') {
      updatePayload.publishedBy = approvedBy || existing.author || 'HR Management';
      updatePayload.publishedAt = new Date();
    }

    const updated = await this.repo.updateCommunication(id, updatePayload);
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

    // Verify and look up employee
    let empName = data.employeeName;
    let designation = data.designation;
    let department = data.department;

    if (data.employeeId) {
      const isOid = mongoose.Types.ObjectId.isValid(data.employeeId);
      const emp = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: data.employeeId }, { _id: data.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: data.employeeId });

      if (emp) {
        if (!empName) empName = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        if (!designation) designation = emp.jobTitle || 'Employee';
        if (!department) department = emp.department || 'General';
      }
    }

    return await this.repo.createIssuedLetter({
      ...data,
      employeeName: empName,
      designation: designation,
      department: department,
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
  // DYNAMIC LETTER GENERATION
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
    const compName = String(payload.companyName || 'HUREMASO Global Technologies');
    const joiningDate = String(employee ? 'January 15, 2024' : 'Recent');
    const dateNow = String(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const employeeIdStr = String(employee ? employee.employeeId : payload.employeeId || 'EMP2024001');

    let templateSubject = payload.subject || template.subject;
    let templateBody = template.body || template.message || '';

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

    let issuedRecord: IIssuedLetter | undefined;
    try {
      issuedRecord = await this.repo.createIssuedLetter({
        employeeId: employeeIdStr,
        employeeName: empName,
        designation: jobTitle,
        department: employee?.department || 'General',
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

  // ==========================================
  // AI-ASSISTED DOCUMENT DRAFTING
  // ==========================================
  async generateAIDraft(dto: AIDraftRequestDTO): Promise<AIDraftResponseDTO> {
    const currentYear = new Date().getFullYear();
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const prefixMap = { memo: 'MEMO', notice: 'NOT', circular: 'CIR', letter: 'LTR' };
    const suggestedRef = `${prefixMap[dto.category] || 'DOC'}-${currentYear}-${randSeq}`;

    let empDetails: any = null;
    if (dto.employeeId) {
      const isOid = mongoose.Types.ObjectId.isValid(dto.employeeId);
      empDetails = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: dto.employeeId }, { _id: dto.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: dto.employeeId });
    }

    const department = dto.department || (empDetails ? empDetails.department : 'All Departments');
    const targetAudience = dto.targetAudience || 'All Staff';
    const employeeName = empDetails ? empDetails.name || `${empDetails.firstName || ''} ${empDetails.lastName || ''}`.trim() : 'Respected Team Member';
    const jobTitle = empDetails ? empDetails.jobTitle || 'Team Member' : 'Professional Staff';

    const promptText = `Draft an official HR ${dto.category.toUpperCase()} document for HUREMASO Global Technologies.
Subject: ${dto.subject}
Category: ${dto.category}
Department: ${department}
Target Audience: ${targetAudience}
Employee Context: ${empDetails ? `Name: ${employeeName}, Role: ${jobTitle}, ID: ${dto.employeeId}` : 'General Corporate Audience'}
Instructions / Guidance: ${dto.instructions || 'Ensure formal, clear, legally compliant HR communication tone.'}

Please output the complete, professional draft text ready to be reviewed, saved, and published.`;

    let aiContent = '';
    let modelName = 'Huremaso-AI-Native';

    try {
      const aiResponse = await aiProvider.generateChatResponse(promptText, {
        category: dto.category,
        subject: dto.subject,
        department,
        employeeName,
      });

      if (aiResponse && aiResponse.text && aiResponse.text.trim() !== '') {
        aiContent = aiResponse.text.trim();
        modelName = process.env.GEMINI_API_KEY ? 'Google-Gemini-1.5' : 'Huremaso-Domain-RAG';
      }
    } catch (err: any) {
      console.warn('AI Provider failed during draft generation, using structured fallback:', err?.message || err);
    }

    // Assemble complete, professional document incorporating AI intelligence and formal HR structure
    let generatedBody = '';
    const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (dto.category === 'memo') {
      generatedBody = `MEMORANDUM\n\nTO: ${targetAudience} (${department})\nFROM: Human Resources & Corporate Governance\nDATE: ${dateFormatted}\nSUBJECT: ${dto.subject}\nREF: ${suggestedRef}\n\n1. PURPOSE\nThis memorandum formally communicates organizational policy regarding "${dto.subject}".\n\n2. DIRECTIVES & PROCEDURAL GUIDELINES\n${aiContent || 'All team members within the designated departments are expected to adhere to the outlined operational framework.'}\n\n3. COMPLIANCE & TIMELINE\nDepartment leads shall oversee compliance. These provisions take effect immediately upon distribution.\n\nSincerely,\nHuman Resources Operations Team\nHUREMASO Global Technologies`;
    } else if (dto.category === 'notice') {
      generatedBody = `PUBLIC HR NOTICE\n\nNOTICE NO: ${suggestedRef}\nDATE: ${dateFormatted}\nTARGET AUDIENCE: ${targetAudience}\nDEPARTMENT: ${department}\n\nSUBJECT: ${dto.subject}\n\nNotice is hereby given to all employees regarding "${dto.subject}".\n\n${aiContent || 'All personnel are kindly requested to take note of the schedule and guidelines detailed herein.'}\n\nFor questions or support, contact the People Operations desk.\n\nBy Order of Management,\nHead of People & Culture\nHUREMASO Global Technologies`;
    } else if (dto.category === 'circular') {
      generatedBody = `DEPARTMENT CIRCULAR\n\nCIRCULAR REF: ${suggestedRef}\nDATE: ${dateFormatted}\nISSUING AUTHORITY: Executive Management\nAPPLICABLE DEPARTMENTS: ${department}\n\nSUBJECT: ${dto.subject}\n\n1. SCOPE & OBJECTIVES\nThis circular establishes updated corporate procedures concerning "${dto.subject}".\n\n2. ACTION ITEMS & MANDATES\n${aiContent || 'Each division lead shall ensure seamless execution and submission of status updates in accordance with compliance standards.'}\n\nAuthorized by,\nChief Human Resources Officer\nHUREMASO Global Technologies`;
    } else {
      generatedBody = `OFFICIAL HR CORRESPONDENCE\n\nREF: ${suggestedRef}\nDATE: ${dateFormatted}\nTO: ${employeeName} (${dto.employeeId || 'EMP'})\nDESIGNATION: ${jobTitle}\nDEPARTMENT: ${department}\n\nSUBJECT: ${dto.subject}\n\nDear ${employeeName},\n\nWe are pleased to address this official communication regarding "${dto.subject}".\n\n${aiContent || 'On behalf of HUREMASO Global Technologies, we formally acknowledge and document this milestone in your professional tenure.'}\n\nPlease retain this official document for your records.\n\nWarm regards,\nHuman Resources Operations\nHUREMASO Global Technologies`;
    }

    return {
      category: dto.category,
      title: dto.subject,
      subject: dto.subject,
      content: generatedBody,
      department,
      targetAudience,
      priority: dto.priority || 'Medium',
      suggestedReferenceNumber: suggestedRef,
      model: modelName,
    };
  }

  // ==========================================
  // PDF GENERATION & EXPORT
  // ==========================================
  async generateCommunicationPDF(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const comm = await this.repo.findCommunicationById(id);
    if (!comm) throw AppError.notFound(`Communication with ID ${id} not found`);

    const safeRef = (comm.referenceNumber || `DOC-${id.slice(-6)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `HUREMASO_${comm.type.toUpperCase()}_${safeRef}.pdf`;

    const options: PDFDocumentOptions = {
      title: comm.title,
      documentType: (comm.type === 'letter' || comm.type === 'letters' ? 'letter' : comm.type) as any,
      referenceNumber: comm.referenceNumber || `REF-${id.slice(-6)}`,
      date: comm.date || comm.issuedDate || new Date().toISOString().split('T')[0],
      department: comm.department || comm.targetAudience || 'All Departments',
      targetAudience: comm.targetAudience,
      author: comm.author || comm.createdBy || 'HR Operations Team',
      status: comm.status,
      content: comm.content || 'Official document content.',
      recipientName: comm.recipient,
      effectiveDate: comm.effectiveDate,
    };

    const buffer = generateHrDocumentPDF(options);
    return { buffer, filename };
  }

  async generateIssuedLetterPDF(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const letter = await this.repo.findIssuedLetterById(id);
    if (!letter) throw AppError.notFound(`Issued letter record with ID ${id} not found`);

    const safeRef = (letter.referenceNumber || `LTR-${id.slice(-6)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `HUREMASO_LETTER_${safeRef}.pdf`;

    const options: PDFDocumentOptions = {
      title: letter.subject || letter.letterType,
      documentType: 'letter',
      referenceNumber: letter.referenceNumber || `LTR-${id.slice(-6)}`,
      date: letter.issuedDate || new Date().toISOString().split('T')[0],
      department: letter.department || 'General',
      author: letter.issuedBy || letter.createdBy || 'HR Management',
      status: letter.status,
      content: letter.content,
      recipientName: letter.employeeName,
      recipientId: letter.employeeId,
      effectiveDate: letter.effectiveDate,
    };

    const buffer = generateHrDocumentPDF(options);
    return { buffer, filename };
  }

  async generateDynamicPDF(options: PDFDocumentOptions): Promise<{ buffer: Buffer; filename: string }> {
    const safeRef = (options.referenceNumber || 'DOC-2026').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `HUREMASO_${options.documentType.toUpperCase()}_${safeRef}.pdf`;
    const buffer = generateHrDocumentPDF(options);
    return { buffer, filename };
  }

  // ==========================================
  // METRICS & COUNTS
  // ==========================================
  async getCountsSummary(): Promise<HRLetterStatsSummary> {
    return await this.repo.getCountsSummary();
  }
}

export const hrLetterService = new HrLetterService();
