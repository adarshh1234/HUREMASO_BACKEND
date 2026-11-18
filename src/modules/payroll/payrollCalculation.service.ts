import { PayrollCalculationInput, PayrollCalculationResult } from './payroll.types';

export class PayrollCalculationService {
  /**
   * Safe decimal rounding to 2 decimal places to avoid IEEE 754 floating-point inaccuracies
   */
  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Centralized payroll calculation engine
   */
  calculate(input: PayrollCalculationInput): PayrollCalculationResult {
    const basic = Math.max(0, input.basicSalary || 0);
    const hra = Math.max(0, input.hra || 0);
    const allowances = Math.max(0, input.allowances || 0);
    const bonuses = Math.max(0, input.bonuses || 0);
    const incentives = Math.max(0, input.incentives || 0);
    const overtimeHours = Math.max(0, input.overtimeHours || 0);
    const overtimeRate = Math.max(0, input.overtimeRate || 0);
    const overtimeEarnings = this.round(overtimeHours * overtimeRate);

    // 1. Gross Earnings
    const grossSalary = this.round(
      basic + hra + allowances + bonuses + incentives + overtimeEarnings
    );

    // 2. Statutory EPF (12% of basic employee, 12% employer)
    let epfDeduction = 0;
    let epfEmployerContribution = 0;
    if (input.includeEpf) {
      epfDeduction = this.round(basic * 0.12);
      epfEmployerContribution = this.round(basic * 0.12);
    }

    // 3. Statutory ESI (0.75% employee, 3.25% employer if wage <= threshold)
    let esiDeduction = 0;
    let esiEmployerContribution = 0;
    if (input.includeEsi && grossSalary <= 3000) {
      esiDeduction = this.round(grossSalary * 0.0075);
      esiEmployerContribution = this.round(grossSalary * 0.0325);
    }

    // 4. Tax deductions (TDS)
    const taxRate = input.taxRatePercent !== undefined ? Math.max(0, input.taxRatePercent) : 10;
    const taxDeductions = this.round((grossSalary * taxRate) / 100);

    // 5. Loan, Advance, and other deductions
    const advanceDeduction = Math.max(0, input.advanceDeduction || 0);
    const loanRepayment = Math.max(0, input.loanRepayment || 0);
    const otherDeductions = Math.max(0, input.otherDeductions || 0);

    // 6. Total Deductions
    const totalDeductions = this.round(
      epfDeduction +
      esiDeduction +
      taxDeductions +
      advanceDeduction +
      loanRepayment +
      otherDeductions
    );

    // 7. Net Payout (cannot be negative)
    const netSalary = Math.max(0, this.round(grossSalary - totalDeductions));

    return {
      basicSalary: basic,
      hra,
      allowances,
      bonuses,
      incentives,
      overtimeEarnings,
      grossSalary,
      epfDeduction,
      epfEmployerContribution,
      esiDeduction,
      esiEmployerContribution,
      taxDeductions,
      advanceDeduction,
      loanRepayment,
      otherDeductions,
      totalDeductions,
      netSalary,
    };
  }
}

export const payrollCalculationService = new PayrollCalculationService();
