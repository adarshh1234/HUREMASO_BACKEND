import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { OffboardingRecordModel } from '../src/modules/offboarding/record/offboardingRecord.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await OffboardingRecordModel.deleteMany({});
});

afterAll(async () => {
  await OffboardingRecordModel.deleteMany({});
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Employee Offboarding Module Integration Tests (/api/v1/offboarding/records)', () => {
  let createdCaseId: string;

  // 1. CASE MANAGEMENT & INITIATION
  describe('1. Case Initiation & Management', () => {
    it('should create an offboarding record with 201 status', async () => {
      const res = await request(app)
        .post('/api/v1/offboarding/records')
        .send({
          employeeName: 'Marcus Brody',
          employeeId: 'EMP-9021',
          role: 'Senior Product Designer',
          department: 'Product & Design',
          separationType: 'Resignation',
          noticeDuration: '30 Days',
          lastWorkingDate: '2026-12-15',
          resignationDate: '2026-11-15',
          hrPersonnel: 'Eleanor Vance',
          reason: 'Accepted senior leadership role at allied venture',
          status: 'Initiated',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('Marcus Brody');
      expect(res.body.data.role).toBe('Senior Product Designer');
      expect(res.body.data.separationType).toBe('Resignation');
      expect(res.body.data.status).toBe('Initiated');
      expect(res.body.data.recordId).toMatch(/^OFF-\d+/);

      createdCaseId = res.body.data._id || res.body.data.id;
    });

    it('should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/offboarding/records')
        .send({
          employeeName: '',
          separationType: 'InvalidType',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should list offboarding records with search and filter queries', async () => {
      const res = await request(app)
        .get('/api/v1/offboarding/records')
        .query({ search: 'Marcus', separationType: 'Resignation' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].employeeName).toBe('Marcus Brody');
    });

    it('should fetch a single offboarding case by ID', async () => {
      const res = await request(app).get(`/api/v1/offboarding/records/${createdCaseId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeId).toBe('EMP-9021');
    });

    it('should update case status and general fields with PATCH', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}`)
        .send({
          status: 'Notice Period',
          lastWorkingDate: '2026-12-30',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Notice Period');
      expect(res.body.data.lastWorkingDate).toBe('2026-12-30');
    });
  });

  // 2. DOCUMENT STUDIO
  describe('2. Document Studio (Resignation & Termination Letters)', () => {
    it('should update resignation letter draft content', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/document`)
        .send({
          type: 'resignation',
          letterContent: 'Dear Team, Please accept this formal notification of my resignation...',
          reason: 'Pursuing new opportunities',
          resignationDate: '2026-11-15',
          lastWorkingDate: '2026-12-30',
          noticeDuration: '45 Days',
          status: 'Submitted',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents.resignationLetter.status).toBe('Submitted');
      expect(res.body.data.documents.resignationLetter.letterContent).toContain('Dear Team');
    });

    it('should update termination letter with severance terms', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/document`)
        .send({
          type: 'termination',
          letterContent: 'Dear Marcus, This document outlines standard termination terms...',
          terminationType: 'Mutual Separation',
          effectiveDate: '2026-12-30',
          severanceDetails: '2 Months Base Pay plus accrued PTO encashment',
          status: 'Drafted',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents.terminationLetter.severanceDetails).toBe('2 Months Base Pay plus accrued PTO encashment');
      expect(res.body.data.documents.terminationLetter.terminationType).toBe('Mutual Separation');
    });
  });

  // 3. PERFORMANCE RETROSPECTIVE
  describe('3. Performance Retrospective (Milestones, Appraisals, References)', () => {
    it('should add career milestones, appraisal reviews, and references', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/performance`)
        .send({
          history: [
            {
              period: 'Jan 2023 - Dec 2024',
              position: 'Product Designer',
              department: 'Design',
              type: 'Joining',
              details: 'Redesigned design system and reduced drop-off by 22%',
            },
            {
              period: 'Jan 2025 - Present',
              position: 'Senior Product Designer',
              department: 'Product & Design',
              type: 'Promotion',
              details: 'Led mobile app v2.0 overhaul',
            },
          ],
          appraisals: [
            {
              cycle: 'Annual 2025',
              rating: 4.8,
              managerFeedback: 'Exceptional visual design and design-system scaling.',
              achievements: 'Shipped design token library across 5 apps',
              date: '2025-12-10',
            },
          ],
          references: [
            {
              name: 'Dr. Henry Jones',
              designation: 'VP of Product',
              company: 'Archival Systems',
              contactInfo: 'hjones@archivalsystems.org',
              relationship: 'Direct Manager',
              status: 'Verified',
            },
          ],
          rehireEligible: true,
          projectHandoverComplete: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.performance.history.length).toBe(2);
      expect(res.body.data.performance.appraisals[0].rating).toBe(4.8);
      expect(res.body.data.performance.references[0].status).toBe('Verified');
      expect(res.body.data.performance.rehireEligible).toBe(true);
    });
  });

  // 4. FINAL FINANCIAL SETTLEMENT
  describe('4. Final Financial Settlement (F&F)', () => {
    it('should compute compensation breakdown and calculate accurate net payout', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/settlement`)
        .send({
          basicSalary: 8000,
          pendingSalaryAmount: 4000,
          pendingExpenseAmount: 750,
          allowances: 1200,
          bonuses: 3000,
          encashableLeaveDays: 10,
          leaveEncashmentAmount: 2666.7,
          gratuityAmount: 6500,
          otherBenefits: 500,
          assetDeductions: 250,
          otherDeductions: 100,
          status: 'Approved',
          auditAction: 'Audited and Approved by Finance Lead',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const settlement = res.body.data.settlement;
      expect(settlement.status).toBe('Approved');
      expect(settlement.basicSalary).toBe(8000);
      expect(settlement.pendingSalaryAmount).toBe(4000);
      expect(settlement.pendingExpenseAmount).toBe(750);
      expect(settlement.leaveEncashmentAmount).toBeCloseTo(2666.7, 1);
      // Total deductions: 250 + 100 = 350
      expect(settlement.deductions).toBe(350);
      // Net payout should exceed 15000
      expect(settlement.netPayout).toBeGreaterThan(15000);
      expect(settlement.auditHistory.length).toBeGreaterThanOrEqual(1);
    });

    it('should disburse the settlement with a transaction reference', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/settlement`)
        .send({
          status: 'Disbursed',
          paymentReference: 'WIRE-US-9982410-HR',
          disbursedDate: '2026-11-17',
          auditAction: 'Settlement Disbursed via Bank Transfer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settlement.status).toBe('Disbursed');
      expect(res.body.data.settlement.paymentReference).toBe('WIRE-US-9982410-HR');
    });
  });

  // 5. LEGAL CLEARANCE & REVOCATION
  describe('5. Legal Clearance & Revocation', () => {
    it('should update legal cheque voucher, visa, insurance, and PCC clearance', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/legal`)
        .send({
          chequeVoucherNo: 'CHQ-2026-8812',
          chequeAmount: 18450,
          chequeStatus: 'Issued',
          chequeIssueDate: '2026-11-17',
          visaType: 'Employment Residence (Tier 1)',
          visaCancellationStatus: 'In Progress',
          visaGracePeriodDays: 30,
          insuranceProvider: 'Bupa Global Platinum',
          insurancePolicyNo: 'BUPA-POL-882190',
          insuranceDelisted: true,
          insuranceCancellationDate: '2026-11-16',
          pccStatus: 'Clear',
          pccCertificateRef: 'PCC-POLICE-2026-99',
          nocIssued: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.legal.chequeStatus).toBe('Issued');
      expect(res.body.data.legal.insuranceDelisted).toBe(true);
      expect(res.body.data.legal.pccStatus).toBe('Clear');
      expect(res.body.data.legal.nocIssued).toBe(true);
    });
  });

  // 6. ASSET RETURN & IT CLEARANCE
  describe('6. Asset Return & IT Clearance', () => {
    it('should update asset status, log missing item deduction, and sync to F&F', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/assets`)
        .send({
          items: [
            {
              name: 'MacBook Pro 16" M3 Max',
              tag: 'AST-MBP-9021',
              category: 'Hardware',
              status: 'Returned',
              condition: 'Normal Wear',
              returnDate: '2026-11-16',
              returnCondition: 'Excellent',
              verifiedBy: 'IT Support',
            },
            {
              name: 'YubiKey 5C NFC',
              tag: 'AST-SEC-4412',
              category: 'Hardware',
              status: 'Missing',
              deductionCost: 85,
            },
          ],
          missingItems: [
            {
              name: 'YubiKey 5C NFC',
              tag: 'AST-SEC-4412',
              reportedDate: '2026-11-16',
              investigator: 'IT Security Lead',
              explanation: 'Lost during business transit',
              deductionApproved: true,
              deductionAmount: 85,
            },
          ],
          dependencies: [
            {
              task: 'GitHub Enterprise & Org Deprovisioning',
              category: 'Access',
              status: 'Completed',
              serviceName: 'GitHub',
            },
            {
              task: 'Google Workspace Workspace & Drive Ownership Transfer',
              category: 'Access',
              status: 'Signed Off',
              serviceName: 'Google',
            },
          ],
          isFullyCleared: true,
          clearedBy: 'Marcus Brody',
          inspectionPassed: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assets.items[0].status).toBe('Returned');
      expect(res.body.data.assets.missingItems.length).toBe(1);
      expect(res.body.data.assets.isFullyCleared).toBe(true);
      // Asset deduction should have synced to settlement (85 from missing item + 85 from missing list = 170)
      expect(res.body.data.settlement.assetDeductions).toBe(170);
    });
  });

  // 7. REPATRIATION & CUSTOM FIELDS
  describe('7. Repatriation & Custom Fields', () => {
    it('should book and issue travel repatriation ticket', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/travel`)
        .send({
          repatriationTicketRequired: true,
          destination: 'London Heathrow (LHR)',
          airline: 'British Airways',
          flightDate: '2026-12-20',
          ticketStatus: 'Issued',
          ticketType: 'Commercial One-Way',
          excessBaggageAllowance: 46,
          allowanceStatus: 'Approved',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.travel.ticketStatus).toBe('Issued');
      expect(res.body.data.travel.airline).toBe('British Airways');
      expect(res.body.data.travel.destination).toBe('London Heathrow (LHR)');
    });

    it('should add custom metadata fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/offboarding/records/${createdCaseId}/custom-fields`)
        .send({
          customFields: [
            {
              key: 'relocationPackage',
              label: 'Relocation Assistance Package',
              type: 'text',
              value: 'Container shipment authorization granted',
            },
            {
              key: 'taxResidencyClearance',
              label: 'Tax Residency Clearance Form Filed',
              type: 'checkbox',
              value: true,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customFields.length).toBe(2);
      expect(res.body.data.customFields[0].label).toBe('Relocation Assistance Package');
    });
  });

  // 8. REPORTS & ANALYTICS
  describe('8. Reports & Analytics Summary (/reports/summary)', () => {
    it('should aggregate dynamic offboarding statistics from MongoDB', async () => {
      const res = await request(app).get('/api/v1/offboarding/records/reports/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const metrics = res.body.data;
      expect(typeof metrics.totalOffboarding).toBe('number');
      expect(metrics.totalOffboarding).toBeGreaterThanOrEqual(1);
      expect(typeof metrics.averageClearanceDays).toBe('number');
      expect(typeof metrics.assetRecoveryRate).toBe('number');
      expect(typeof metrics.rehireEligibilityRate).toBe('number');
      expect(typeof metrics.departmentAttrition).toBe('object');
      expect(typeof metrics.separationReasons).toBe('object');
      expect(Object.keys(metrics.departmentAttrition!).length).toBeGreaterThanOrEqual(1);
    });
  });

  // 9. CASE DELETION
  describe('9. Case Deletion', () => {
    it('should delete the test offboarding record', async () => {
      const res = await request(app).delete(`/api/v1/offboarding/records/${createdCaseId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const verifyRes = await request(app).get(`/api/v1/offboarding/records/${createdCaseId}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
