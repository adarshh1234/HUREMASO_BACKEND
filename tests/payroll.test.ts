import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app';
import { PayrollRecordModel } from '../src/modules/payroll/record/payrollRecord.model';
import { PayGradeModel } from '../src/modules/payroll/payGrade/payGrade.model';
import { BenefitSchemeModel } from '../src/modules/payroll/benefitAdvance/benefitScheme.model';
import { BenefitAdvanceModel } from '../src/modules/payroll/benefitAdvance/benefitAdvance.model';
import { FinanceRequestModel } from '../src/modules/payroll/financeRequest/financeRequest.model';
import { SalaryDisbursementModel } from '../src/modules/payroll/salaryDisbursement/salaryDisbursement.model';
import { PaymentApplicationModel } from '../src/modules/payroll/paymentApplication/paymentApplication.model';
import { payrollCalculationService } from '../src/modules/payroll/payrollCalculation.service';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await Promise.all([
    PayrollRecordModel.deleteMany({}),
    PayGradeModel.deleteMany({}),
    BenefitSchemeModel.deleteMany({}),
    BenefitAdvanceModel.deleteMany({}),
    FinanceRequestModel.deleteMany({}),
    SalaryDisbursementModel.deleteMany({}),
    PaymentApplicationModel.deleteMany({}),
  ]);
});

afterAll(async () => {
  await Promise.all([
    PayrollRecordModel.deleteMany({}),
    PayGradeModel.deleteMany({}),
    BenefitSchemeModel.deleteMany({}),
    BenefitAdvanceModel.deleteMany({}),
    FinanceRequestModel.deleteMany({}),
    SalaryDisbursementModel.deleteMany({}),
    PaymentApplicationModel.deleteMany({}),
  ]);
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('HUREMASO HRMS - Full Payroll Module Integration Tests', () => {
  // ─── 1. CALCULATION ENGINE TESTS ───────────────────────────────────────────
  describe('1. Payroll Calculation Engine', () => {
    it('should compute exact basic, allowances, deductions, taxes, and net payout', () => {
      const result = payrollCalculationService.calculate({
        basicSalary: 5000,
        hra: 1500,
        allowances: 1000,
        bonuses: 500,
        incentives: 0,
        taxRatePercent: 10,
        advanceDeduction: 400,
        loanRepayment: 200,
        otherDeductions: 100,
        includeEpf: false,
        includeEsi: false,
      });

      expect(result.grossSalary).toBe(8000);
      expect(result.taxDeductions).toBe(800);
      expect(result.totalDeductions).toBe(1500);
      expect(result.netSalary).toBe(6500);
    });
  });

  // ─── 2. PAY GRADES ──────────────────────────────────────────────────────────
  describe('2. Pay Grades API (/api/v1/payroll/pay-grades)', () => {
    let gradeId: string;

    it('should create a new pay grade', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/pay-grades')
        .send({
          gradeCode: 'GR-EXEC-1',
          gradeName: 'Executive Leadership Grade 1',
          minSalary: 8000,
          maxSalary: 15000,
          currency: 'USD',
          description: 'Executive management pay band',
          allowances: [
            { name: 'Executive Travel Allowance', amount: 1200, isTaxable: true },
            { name: 'Health Wellness Allowance', amount: 500, isTaxable: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gradeCode).toBe('GR-EXEC-1');
      gradeId = res.body.data._id || res.body.data.id;
    });

    it('should list all pay grades including seeded ones', async () => {
      const res = await request(app).get('/api/v1/payroll/pay-grades');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should update an existing pay grade', async () => {
      const res = await request(app)
        .patch(`/api/v1/payroll/pay-grades/${gradeId}`)
        .send({
          maxSalary: 16000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.maxSalary).toBe(16000);
    });
  });

  // ─── 3. PAYROLL RECORDS & ONE-TAP ATS ───────────────────────────────────────
  describe('3. Payroll Records & OneTap (/api/v1/payroll/records)', () => {
    let recordId: string;

    it('should create a payroll record with full financial breakdown', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/records')
        .send({
          employeeName: 'Elena Rostova',
          employeeId: 'EMP-7701',
          department: 'Engineering',
          period: 'July 2025',
          basicSalary: 6000,
          grossSalary: 7500,
          totalDeductions: 1200,
          netSalary: 6300,
          payGrade: 'Grade A',
          status: 'Pending',
          paymentMethod: 'Bank Transfer',
          advanceDetails: {
            hasActiveAdvance: true,
            advanceBalance: 1200,
            monthlyDeduction: 300,
          },
          payOnRequestDetails: {
            requestedEarlyPay: true,
            earlyAmountRequested: 1000,
            isApproved: false,
            requestedDate: '2025-07-15',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('Elena Rostova');
      recordId = res.body.data._id || res.body.data.id;
    });

    it('should fetch employment status summary from real database', async () => {
      const res = await request(app).get('/api/v1/payroll/records/employment-status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalEmployees');
      expect(res.body.data).toHaveProperty('activeCount');
      expect(Array.isArray(res.body.data.employees)).toBe(true);
    });

    it('should fetch aggregated reports and analytics summary', async () => {
      const res = await request(app).get('/api/v1/payroll/records/reports/summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalGrossPayroll');
      expect(res.body.data).toHaveProperty('totalNetPayroll');
      expect(res.body.data).toHaveProperty('departmentDistribution');
      expect(res.body.data).toHaveProperty('monthlyTrends');
    });

    it('should disburse/pay a salary record with transaction reference', async () => {
      const res = await request(app)
        .post(`/api/v1/payroll/records/${recordId}/pay`)
        .send({
          transactionReference: 'TXN-ELENA-2025',
          remarks: 'Bank transfer cleared via Stripe ACH',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Paid');
    });

    it('should generate official salary slip URL for record', async () => {
      const res = await request(app).post(`/api/v1/payroll/records/${recordId}/generate-slip`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('slipUrl');
      expect(res.body.data.slipPublishedDate).toBeDefined();
    });

    it('should approve Pay On Request for record', async () => {
      const res = await request(app)
        .post(`/api/v1/payroll/records/${recordId}/approve-pay-request`)
        .send({ status: 'Approved', approvalRemarks: 'Early pay approved for medical emergency' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Paid');
    });
  });

  // ─── 4. BENEFIT SCHEMES & ADVANCES ─────────────────────────────────────────
  describe('4. Benefit Schemes & Advances (/api/v1/payroll/benefit-advances)', () => {
    let schemeId: string;
    let advanceId: string;

    it('should list configured benefit schemes by category', async () => {
      const res = await request(app).get('/api/v1/payroll/benefit-advances/schemes?category=employee-benefits');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should create a custom benefit scheme', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/benefit-advances/schemes')
        .send({
          name: 'Annual Wellness & Fitness Grant',
          category: 'benefit-advance',
          tab: 'General',
          description: 'Subsidized annual fitness and sports reimbursement',
          maxLimit: 1500,
          eligibility: 'All permanent employees',
          frequency: 'Annual',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Annual Wellness & Fitness Grant');
      schemeId = res.body.data._id || res.body.data.id;
    });

    it('should apply for a benefit advance', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/benefit-advances')
        .send({
          employeeName: 'Marcus Chen',
          employeeId: 'EMP-8820',
          benefitType: 'Annual Wellness & Fitness Grant',
          category: 'benefit-advance',
          tab: 'General',
          amount: 1200,
          description: 'Reimbursement for annual membership and fitness equipment',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employeeName).toBe('Marcus Chen');
      expect(res.body.data.status).toBe('Pending');
      advanceId = res.body.data._id || res.body.data.id;
    });

    it('should approve a benefit advance with review remarks', async () => {
      const res = await request(app)
        .patch(`/api/v1/payroll/benefit-advances/${advanceId}/status`)
        .send({
          status: 'Approved',
          remarks: 'Gym membership receipts verified against wellness policy',
          approvedBy: 'HR Director',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.approvedBy).toBe('HR Director');
    });
  });

  // ─── 5. EMPLOYEE FINANCE REQUESTS ──────────────────────────────────────────
  describe('5. Employee Finance Requests (/api/v1/payroll/finance-requests)', () => {
    let requestId: string;

    it('should create an employee finance request', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/finance-requests')
        .send({
          employeeName: 'Sophia Lindqvist',
          employeeId: 'EMP-4421',
          requestType: 'Salary Advance',
          department: 'Engineering',
          amount: 2500,
          description: 'Relocation expenses advance for city office transfer',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.employeeName).toBe('Sophia Lindqvist');
      expect(res.body.data.status).toBe('Pending');
      requestId = res.body.data._id || res.body.data.id;
    });

    it('should approve a finance request and record audit history', async () => {
      const res = await request(app)
        .patch(`/api/v1/payroll/finance-requests/${requestId}/status`)
        .send({
          status: 'Approved',
          remarks: 'Approved per standard relocation policy',
          approvedBy: 'VP Operations',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Approved');
      expect(res.body.data.history).toBeDefined();
      expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 6. SALARY DISBURSEMENT ────────────────────────────────────────────────
  describe('6. Salary Disbursement (/api/v1/payroll/disbursements)', () => {
    let disbId: string;

    it('should create a salary disbursement record', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/disbursements')
        .send({
          employeeName: 'Dmitri Volkov',
          employeeId: 'EMP-9901',
          department: 'Finance',
          period: 'July 2025',
          grossAmount: 7000,
          deductions: 1000,
          method: 'Stripe',
          notes: 'Regular monthly compensation payout',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.netAmount).toBe(6000);
      expect(res.body.data.status).toBe('Pending');
      disbId = res.body.data._id || res.body.data.id;
    });

    it('should return disbursement summary metrics', async () => {
      const res = await request(app).get('/api/v1/payroll/disbursements/summary');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalGross');
      expect(res.body.data).toHaveProperty('totalNet');
      expect(res.body.data).toHaveProperty('totalPending');
    });

    it('should disburse payment with transaction reference', async () => {
      const res = await request(app)
        .post(`/api/v1/payroll/disbursements/${disbId}/disburse`)
        .send({
          transactionRef: 'STRIPE-PAY-9921',
          remarks: 'Disbursed via automated Stripe ACH transfer',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Paid');
      expect(res.body.data.transactionRef).toBe('STRIPE-PAY-9921');
    });
  });

  // ─── 7. PAYMENT APPLICATIONS & GATEWAYS ────────────────────────────────────
  describe('7. Payment Applications (/api/v1/payroll/payment-apps)', () => {
    let appId: string;

    it('should create payment gateway integration with credential masking', async () => {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'test_dummy_mock_api_key_for_testing';

      const res = await request(app)
        .post('/api/v1/payroll/payment-apps')
        .send({
          name: 'Stripe Live Payroll Payouts',
          provider: 'Stripe',
          environment: 'Production',
          apiKey: stripeSecretKey,
          webhookUrl: 'https://api.huremaso.com/v1/webhooks/stripe',
          autoDisburse: true,
          disbursementDay: 28,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Stripe Live Payroll Payouts');
      expect(res.body.data.apiKeyMasked).toBeDefined();
      expect(res.body.data.apiKey).toBeUndefined(); // Ensure raw secret is not returned
      appId = res.body.data._id || res.body.data.id;
    });

    it('should execute live connection test endpoint', async () => {
      const res = await request(app).post(`/api/v1/payroll/payment-apps/${appId}/test-connection`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('latencyMs');
      expect(res.body.data).toHaveProperty('verifiedAt');
    });

    it('should execute payment gateway synchronization', async () => {
      const res = await request(app).post(`/api/v1/payroll/payment-apps/${appId}/sync`);
      expect(res.status).toBe(200);
      expect(res.body.data.lastSyncStatus).toBe('Success');
      expect(res.body.data.lastSync).toBeDefined();
    });
  });

  // ─── 8. AI PAYROLL INTELLIGENCE & COPILOT ──────────────────────────────────
  describe('8. AI Payroll Copilot & Analytics (/api/v1/payroll/ai)', () => {
    it('should respond to suggested conversational questions', async () => {
      const res = await request(app)
        .post('/api/v1/payroll/ai/chat')
        .send({
          prompt: 'What is the projected turnover rate for this year?',
          tab: 'Workforce',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reply');
      expect(res.body.data.reply.length).toBeGreaterThan(10);
    });

    it('should return workforce turnover and retention analytics', async () => {
      const res = await request(app).get('/api/v1/payroll/ai/workforce-analytics');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('annualizedTurnoverRate');
      expect(res.body.data).toHaveProperty('retentionIndicatorPercent');
      expect(res.body.data).toHaveProperty('departmentTurnover');
    });

    it('should return performance skills and training metrics', async () => {
      const res = await request(app).get('/api/v1/payroll/ai/performance-skills');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('skillGaps');
      expect(res.body.data).toHaveProperty('recommendations');
    });

    it('should return employee experience satisfaction scores', async () => {
      const res = await request(app).get('/api/v1/payroll/ai/employee-experience');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('satisfactionScore');
      expect(res.body.data).toHaveProperty('benefitsUtilizationRate');
    });

    it('should return payroll statutory compliance audit', async () => {
      const res = await request(app).get('/api/v1/payroll/ai/compliance-check');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('healthScorePercent');
      expect(res.body.data).toHaveProperty('statutoryChecks');
    });

    it('should synchronize corporate HR knowledge base', async () => {
      const res = await request(app).post('/api/v1/payroll/ai/sync-knowledge');
      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);
      expect(res.body.data.syncedEntities).toBeGreaterThan(0);
      expect(res.body.data.lastSyncedAt).toBeDefined();
    });
  });
});
