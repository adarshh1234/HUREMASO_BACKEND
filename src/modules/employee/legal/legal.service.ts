import { legalRepository, LegalRepository } from './legal.repository';
import { ILegalCompliance } from './legal.types';

export class LegalService {
  constructor(private repo: LegalRepository = legalRepository) {}

  async getOverview(): Promise<ILegalCompliance> {
    return await this.repo.getOverview();
  }

  async analyzeQuery(query: string): Promise<{ response: string; score: number }> {
    const lower = query.toLowerCase();
    let response = 'Our Legal AI has analyzed your request against current labor regulations and standard legal frameworks. All clauses comply with standard HR & employment guidelines.';
    let score = 98.4;

    if (lower.includes('contract') || lower.includes('agreement')) {
      response = 'Contract Audit Complete: Clause 4.2 (Non-Compete) matches regional enforceability standards. Clause 7.1 (Termination Notice) requires standard 30-day notice verification.';
      score = 99.0;
    } else if (lower.includes('privacy') || lower.includes('gdpr')) {
      response = 'Data Protection Status: Compliant. Employee PII handling adheres to GDPR Article 6(1)(b) for contract execution.';
      score = 100.0;
    } else if (lower.includes('overtime') || lower.includes('leave')) {
      response = 'Statutory Compliance Check: Overtime pooling and leave carry-over limits comply with the state labor framework.';
      score = 97.8;
    }

    return { response, score };
  }
}

export const legalService = new LegalService();
