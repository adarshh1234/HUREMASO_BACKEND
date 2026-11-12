import { LegalComplianceModel } from './legal.model';
import { ILegalCompliance } from './legal.types';

export class LegalRepository {
  async getOverview(): Promise<ILegalCompliance> {
    let comp = await LegalComplianceModel.findOne();
    if (!comp) {
      comp = await LegalComplianceModel.create({
        complianceScore: 98.4,
        activeViolations: 0,
        pendingPolicies: 2,
        auditNotes: 'Zero active legal violations detected across active employment agreements and company policies.',
      });
    }
    return comp;
  }
}

export const legalRepository = new LegalRepository();
