import mongoose from 'mongoose';
import { documentRepository, DocumentRepository } from './document.repository';
import { DocumentFolderModel } from './document.model';
import { EmployeeModel } from '../employee.model';
import { AppError } from '../../../common/errors/AppError';
import { IDocumentFolder, IEmployeeDocument } from './document.types';

export class DocumentService {
  constructor(private repo: DocumentRepository = documentRepository) {}

  // Folders
  async getFolders(): Promise<IDocumentFolder[]> {
    return await this.repo.getFolders();
  }

  async createFolder(name: string, description?: string): Promise<IDocumentFolder> {
    const existing = await DocumentFolderModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      throw AppError.badRequest('Folder with this name already exists');
    }
    return await this.repo.createFolder({ name, description: description || '', count: 0 });
  }

  async deleteFolder(id: string): Promise<void> {
    const deleted = await this.repo.deleteFolder(id);
    if (!deleted) throw AppError.notFound('Folder not found');
  }

  // Documents
  async createDocument(data: {
    name: string;
    category?: string;
    folderId?: string;
    employeeId?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    status?: string;
    expiryDate?: string;
  }): Promise<IEmployeeDocument> {
    let employee = null;
    if (data.employeeId) {
      const isOid = mongoose.Types.ObjectId.isValid(data.employeeId);
      employee = isOid
        ? await EmployeeModel.findOne({ $or: [{ employeeId: data.employeeId }, { _id: data.employeeId }] })
        : await EmployeeModel.findOne({ employeeId: data.employeeId });
    }

    const folderObjectId = data.folderId && mongoose.Types.ObjectId.isValid(data.folderId)
      ? new mongoose.Types.ObjectId(data.folderId)
      : undefined;

    const doc = await this.repo.createDocument({
      name: data.name,
      category: data.category || 'Personal Information',
      folderId: folderObjectId as any,
      employeeId: employee?.employeeId || data.employeeId,
      employeeRef: employee?._id,
      fileUrl: data.fileUrl || '',
      fileType: data.fileType || 'PDF',
      fileSize: data.fileSize || 1024,
      status: data.status || 'Active',
      expiryDate: data.expiryDate || '',
      modified: new Date().toISOString().split('T')[0],
    });

    // Update folder count if folderId provided
    if (folderObjectId) {
      await DocumentFolderModel.findByIdAndUpdate(folderObjectId, { $inc: { count: 1 } });
    }

    return doc;
  }

  async getDocuments(filter: {
    category?: string;
    folderId?: string;
    employeeId?: string;
    search?: string;
  }): Promise<IEmployeeDocument[]> {
    const query: any = {};
    if (filter.category && filter.category !== 'all' && filter.category !== 'All Documents') {
      query.category = { $regex: filter.category, $options: 'i' };
    }
    if (filter.folderId) {
      query.folderId = filter.folderId;
    }
    if (filter.employeeId) {
      query.employeeId = filter.employeeId;
    }
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { category: { $regex: filter.search, $options: 'i' } },
      ];
    }
    const docs = await this.repo.findDocuments(query);
    if (docs.length === 0 && !filter.search && !filter.category) {
      const sample = [
        { name: 'Employee Agreement Template', category: 'Legal Documents', fileType: 'PDF', fileSize: 2048, modified: '2026-02-10' },
        { name: 'Travel Policy 2024', category: 'Travel Documents', fileType: 'PDF', fileSize: 1024, modified: '2026-01-15' },
        { name: 'Remote Work Policy', category: 'Policies', fileType: 'PDF', fileSize: 4096, modified: '2026-02-01' },
        { name: 'Benefits Documentation', category: 'Employee Records', fileType: 'PDF', fileSize: 1536, modified: '2026-02-05' },
      ];
      return await Promise.all(sample.map((s) => this.repo.createDocument(s)));
    }
    return docs;
  }

  async getDocumentById(id: string): Promise<IEmployeeDocument> {
    const doc = await this.repo.findDocumentById(id);
    if (!doc) throw AppError.notFound('Document not found');
    return doc;
  }

  async updateDocument(id: string, updates: Partial<IEmployeeDocument>): Promise<IEmployeeDocument> {
    const updated = await this.repo.updateDocument(id, updates);
    if (!updated) throw AppError.notFound('Document not found');
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    const doc = await this.repo.findDocumentById(id);
    if (!doc) throw AppError.notFound('Document not found');
    await this.repo.deleteDocument(id);
    if (doc.folderId) {
      await DocumentFolderModel.findByIdAndUpdate(doc.folderId, { $inc: { count: -1 } });
    }
  }
}

export const documentService = new DocumentService();
