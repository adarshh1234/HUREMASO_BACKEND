import { DocumentFolderModel, EmployeeDocumentModel } from './document.model';
import { IDocumentFolder, IEmployeeDocument } from './document.types';

export class DocumentRepository {
  // Folders
  async getFolders(): Promise<IDocumentFolder[]> {
    const folders = await DocumentFolderModel.find().sort({ createdAt: 1 });
    if (folders.length === 0) {
      const defaultFolders = [
        { name: 'Personal Information', count: 25 },
        { name: 'Training Report', count: 18 },
        { name: 'Benefits Documents', count: 12 },
        { name: 'Policy Document', count: 8 },
      ];
      return await DocumentFolderModel.insertMany(defaultFolders);
    }
    return folders;
  }

  async createFolder(data: Partial<IDocumentFolder>): Promise<IDocumentFolder> {
    const folder = new DocumentFolderModel(data);
    return await folder.save();
  }

  async deleteFolder(id: string): Promise<boolean> {
    const res = await DocumentFolderModel.findByIdAndDelete(id);
    return !!res;
  }

  // Documents
  async createDocument(data: Partial<IEmployeeDocument>): Promise<IEmployeeDocument> {
    const doc = new EmployeeDocumentModel(data);
    return await doc.save();
  }

  async findDocuments(filter: any = {}): Promise<IEmployeeDocument[]> {
    return await EmployeeDocumentModel.find(filter).sort({ createdAt: -1 });
  }

  async findDocumentById(id: string): Promise<IEmployeeDocument | null> {
    return await EmployeeDocumentModel.findById(id);
  }

  async updateDocument(id: string, data: Partial<IEmployeeDocument>): Promise<IEmployeeDocument | null> {
    return await EmployeeDocumentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteDocument(id: string): Promise<boolean> {
    const res = await EmployeeDocumentModel.findByIdAndDelete(id);
    return !!res;
  }
}

export const documentRepository = new DocumentRepository();
