import { BenefitAdvanceModel } from './benefitAdvance.model';
import { BenefitSchemeModel } from './benefitScheme.model';
import {
  IBenefitAdvanceDocument,
  IBenefitSchemeDocument,
  BenefitAdvanceQueryParams,
  CreateBenefitSchemeDTO,
  UpdateBenefitSchemeDTO,
} from '../payroll.types';
import { escapeRegex } from '../../../common/utils/regex';

export class BenefitAdvanceRepository {
  // ─── Benefit Advance Applications ──────────────────────────────────────────
  async create(data: Partial<IBenefitAdvanceDocument>): Promise<IBenefitAdvanceDocument> {
    const item = new BenefitAdvanceModel(data);
    return item.save();
  }

  async findById(id: string): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findById(id);
  }

  async update(id: string, data: Partial<IBenefitAdvanceDocument>): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async delete(id: string): Promise<IBenefitAdvanceDocument | null> {
    return BenefitAdvanceModel.findByIdAndDelete(id);
  }

  async findAll(params: BenefitAdvanceQueryParams = {}): Promise<{ items: IBenefitAdvanceDocument[]; total: number }> {
    await this.seedIfEmpty();

    const query: Record<string, unknown> = {};

    if (params.search) {
      const regex = new RegExp(escapeRegex(params.search), 'i');
      query.$or = [
        { employeeName: regex },
        { benefitType: regex },
        { advanceId: regex },
        { description: regex },
      ];
    }

    if (params.status && params.status !== 'All') {
      query.status = params.status;
    }

    if (params.category && params.category !== 'all') {
      query.category = params.category;
    }

    if (params.tab && params.tab !== 'all' && params.tab !== 'All') {
      query.tab = params.tab;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
    const skip = (page - 1) * limit;
    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      BenefitAdvanceModel.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      BenefitAdvanceModel.countDocuments(query),
    ]);

    return { items, total };
  }

  // ─── Benefit Schemes / Configurations ──────────────────────────────────────
  async findSchemes(category?: string, tab?: string): Promise<IBenefitSchemeDocument[]> {
    await this.seedSchemesIfEmpty();
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (tab && tab !== 'all') {
      query.tab = tab;
    }
    return BenefitSchemeModel.find(query).sort({ createdAt: 1 });
  }

  async findSchemeById(id: string): Promise<IBenefitSchemeDocument | null> {
    return BenefitSchemeModel.findById(id);
  }

  async createScheme(data: CreateBenefitSchemeDTO): Promise<IBenefitSchemeDocument> {
    const schemeId = data.schemeId || `SCHEME-${Date.now()}`;
    const item = new BenefitSchemeModel({ ...data, schemeId });
    return item.save();
  }

  async updateScheme(id: string, data: UpdateBenefitSchemeDTO): Promise<IBenefitSchemeDocument | null> {
    return BenefitSchemeModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  // ─── Seeding ───────────────────────────────────────────────────────────────
  async seedIfEmpty(): Promise<void> {
    const count = await BenefitAdvanceModel.countDocuments();
    if (count > 0) return;
    const today = new Date().toISOString().split('T')[0];
    await BenefitAdvanceModel.insertMany([
      { advanceId: 'BA-001', employeeName: 'Sarah Johnson', employeeId: 'EMP-1001', benefitType: 'Annual Health Check-ups', category: 'benefit-advance', tab: 'General', amount: 500, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-002', employeeName: 'Michael Chen', employeeId: 'EMP-1004', benefitType: 'Annual Performance Bonus', category: 'employee-benefits', tab: 'Bonus', amount: 8000, status: 'Pending', dateRequested: today },
      { advanceId: 'BA-003', employeeName: 'James Wilson', employeeId: 'EMP-1002', benefitType: 'Sales Commission Incentive', category: 'performance-benefits', tab: 'Incentives', amount: 3500, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-004', employeeName: 'Lisa Anderson', employeeId: 'EMP-1005', benefitType: 'Employees Provident Fund', category: 'other-benefits', tab: 'EPF', amount: 1200, status: 'Approved', dateRequested: today },
      { advanceId: 'BA-005', employeeName: 'David Kim', employeeId: 'EMP-1003', benefitType: 'ESOP Plan 2025', category: 'employee-benefits', tab: 'Stock Options', amount: 0, status: 'Pending', dateRequested: today },
    ]);
  }

  async seedSchemesIfEmpty(): Promise<void> {
    const count = await BenefitSchemeModel.countDocuments();
    if (count > 0) return;

    await BenefitSchemeModel.insertMany([
      // 1. Benefit Advance Cards
      { schemeId: 'SCH-BA-01', category: 'benefit-advance', tab: 'General', title: 'Annual Health Check-ups', description: 'Free or discounted full-body check-ups provided yearly for preventive health.', annualLimit: 800, maxAmount: 800, isEnabled: true },
      { schemeId: 'SCH-BA-02', category: 'benefit-advance', tab: 'General', title: 'Workshops & Conferences', description: 'Sponsorship for attending or speaking at certified industry tech and leadership events.', annualLimit: 2500, maxAmount: 1500, isEnabled: true },
      { schemeId: 'SCH-BA-03', category: 'benefit-advance', tab: 'General', title: 'Cab / Transport Facilities', description: 'Subsidized transportation and commuter cards for commuting to and from workplace.', annualLimit: 1200, maxAmount: 300, isEnabled: true },
      { schemeId: 'SCH-BA-04', category: 'benefit-advance', tab: 'General', title: 'Meal & Food Allowance', description: 'Tax-exempt cafeteria meals stipend or digital food card for all eligible employees.', annualLimit: 1500, maxAmount: 250, isEnabled: true },
      { schemeId: 'SCH-BA-05', category: 'benefit-advance', tab: 'General', title: 'Child Care Allowance', description: 'Direct reimbursement for licensed daycare expenses for children up to 5 years.', annualLimit: 3600, maxAmount: 600, isEnabled: true },
      { schemeId: 'SCH-BA-06', category: 'benefit-advance', tab: 'General', title: 'Gym & Wellness Benefit', description: 'Annual gym membership and fitness class reimbursement for physical health.', annualLimit: 600, maxAmount: 600, isEnabled: true },

      // 2. Employee Benefits
      { schemeId: 'SCH-EB-01', category: 'employee-benefits', tab: 'Bonus', title: 'Annual Performance Bonus', description: 'Year-end bonus based on individual performance ratings and overall company targets.', annualLimit: 25000, maxAmount: 25000, isEnabled: true },
      { schemeId: 'SCH-EB-02', category: 'employee-benefits', tab: 'Bonus', title: 'Festive Bonus', description: 'Special seasonal bonus disbursed during annual holiday festivals and milestones.', annualLimit: 5000, maxAmount: 3000, isEnabled: true },
      { schemeId: 'SCH-EB-03', category: 'employee-benefits', tab: 'Stock Options', title: 'ESOP Plan 2025', description: 'Employee Stock Ownership Plan options vested over a 4-year period with a 1-year cliff.', annualLimit: 50000, maxAmount: 50000, isEnabled: true },
      { schemeId: 'SCH-EB-04', category: 'employee-benefits', tab: 'Stock Options', title: 'RSU Grants', description: 'Restricted Stock Units granted for exceptional quarterly and annual performance.', annualLimit: 75000, maxAmount: 75000, isEnabled: true },
      { schemeId: 'SCH-EB-05', category: 'employee-benefits', tab: 'Performance Benefits', title: 'Quarterly Incentive Scheme', description: 'Direct cash incentives tied to KPI achievements, milestone signoffs, and delivery.', annualLimit: 12000, maxAmount: 4000, isEnabled: true },
      { schemeId: 'SCH-EB-06', category: 'employee-benefits', tab: 'Performance Benefits', title: 'Top Performer Award', description: 'Recognition reward including gift vouchers, travel credits, and extra paid time off.', annualLimit: 3000, maxAmount: 3000, isEnabled: true },
      { schemeId: 'SCH-EB-07', category: 'employee-benefits', tab: "Directors' Benefits", title: 'Executive Health Cover', description: 'Comprehensive global medical coverage for leadership team members and dependents.', annualLimit: 15000, maxAmount: 15000, isEnabled: true },
      { schemeId: 'SCH-EB-08', category: 'employee-benefits', tab: "Directors' Benefits", title: 'Car Allowance', description: 'Dedicated executive transport allowance, fuel reimbursement, and maintenance budget.', annualLimit: 12000, maxAmount: 1200, isEnabled: true },

      // 3. Performance Benefits
      { schemeId: 'SCH-PB-01', category: 'performance-benefits', tab: 'Incentives', title: 'Sales Commission Incentive', description: 'Tiered commission payouts for achieving monthly and quarterly revenue targets.', annualLimit: 30000, maxAmount: 10000, isEnabled: true },
      { schemeId: 'SCH-PB-02', category: 'performance-benefits', tab: 'Incentives', title: 'Quarterly Target Bonus', description: 'Direct incentives tied to KPI achievements and project completion benchmarks.', annualLimit: 15000, maxAmount: 5000, isEnabled: true },
      { schemeId: 'SCH-PB-03', category: 'performance-benefits', tab: 'Increments', title: 'Annual Merit Salary Increment', description: 'Standard annual salary revision based on verified 360-degree appraisal cycles.', annualLimit: 20000, maxAmount: 20000, isEnabled: true },
      { schemeId: 'SCH-PB-04', category: 'performance-benefits', tab: 'Bonus', title: 'Milestone Execution Bonus', description: 'Discretionary project bonus for launching major corporate and client releases.', annualLimit: 8000, maxAmount: 4000, isEnabled: true },

      // 4. Other Benefits (Statutory & Travel)
      { schemeId: 'SCH-OB-01', category: 'other-benefits', tab: 'EPF', title: 'Employees Provident Fund', description: 'Statutory 12% employer and employee contribution with tax-saving benefits.', statutoryType: 'EPF', annualLimit: 20000, isEnabled: true },
      { schemeId: 'SCH-OB-02', category: 'other-benefits', tab: 'Gratuity', title: 'Gratuity Fund', description: 'Retirement and terminal benefit for employees completing 5+ years of continuous service.', statutoryType: 'Gratuity', annualLimit: 25000, isEnabled: true },
      { schemeId: 'SCH-OB-03', category: 'other-benefits', tab: 'ELI', title: 'Employee Life Insurance', description: 'Group term life insurance coverage up to 5x annual base salary.', statutoryType: 'Insurance', annualLimit: 100000, isEnabled: true },
      { schemeId: 'SCH-OB-04', category: 'other-benefits', tab: 'ESI', title: 'Employee State Insurance', description: 'Full medical care and sickness benefits for eligible statutory wage brackets.', statutoryType: 'ESI', annualLimit: 5000, isEnabled: true },
      { schemeId: 'SCH-OB-05', category: 'other-benefits', tab: 'Insurance', title: 'Group Mediclaim Insurance', description: 'Family floater health insurance covering inpatient hospitalization, day care, and OPD.', statutoryType: 'Insurance', annualLimit: 15000, isEnabled: true },
      { schemeId: 'SCH-OB-06', category: 'other-benefits', tab: 'Paid Leave', title: 'Encashable Paid Leave', description: 'Unused earned leave encashment at the end of the financial year or separation.', annualLimit: 8000, isEnabled: true },
      { schemeId: 'SCH-OB-07', category: 'other-benefits', tab: 'Travel', title: 'Travel Allowance (LTA)', description: 'Leave Travel Allowance for domestic and international work and authorized annual vacations.', annualLimit: 6000, isEnabled: true },
    ]);
  }
}

export const benefitAdvanceRepository = new BenefitAdvanceRepository();
