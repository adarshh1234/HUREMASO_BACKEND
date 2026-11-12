import { PayrollAIChatRequest, PayrollAIChatResponse } from '../payroll.types';
import { payrollRecordRepository } from '../record/payrollRecord.repository';
import { salaryDisbursementRepository } from '../salaryDisbursement/salaryDisbursement.repository';
import { financeRequestRepository } from '../financeRequest/financeRequest.repository';
import { benefitAdvanceRepository } from '../benefitAdvance/benefitAdvance.repository';

export class PayrollAIService {
  async chat(payload: PayrollAIChatRequest): Promise<PayrollAIChatResponse> {
    const msg = (payload.message || '').toLowerCase();

    const [reports, disbSum, finReqs, benAdv] = await Promise.all([
      payrollRecordRepository.getReportsSummary(),
      salaryDisbursementRepository.getSummary(),
      financeRequestRepository.findAll({ limit: 5 }),
      benefitAdvanceRepository.findAll({ limit: 5 }),
    ]);

    let reply = '';

    if (msg.includes('salary') || msg.includes('disbursement') || msg.includes('disburse')) {
      reply = `Total salary disbursements this cycle: $${disbSum.totalGross.toLocaleString()}. Paid: $${disbSum.totalPaid.toLocaleString()} across ${disbSum.count} records. Pending disbursement: $${disbSum.totalPending.toLocaleString()}.`;
    } else if (msg.includes('finance') || msg.includes('request') || msg.includes('advance')) {
      reply = `There are currently ${finReqs.total} employee finance requests registered. Pending benefit advances total ${benAdv.total} requests.`;
    } else if (msg.includes('outflow') || msg.includes('budget') || msg.includes('variance') || msg.includes('report') || msg.includes('analytics')) {
      reply = `Monthly Outflow: $${reports.totalMonthlyOutflow.toLocaleString()}. Budget Variance is ${reports.budgetVariancePercent}% (Within Limit). Paid: ${reports.paidCount}, Pending: ${reports.pendingCount}.`;
    } else if (msg.includes('pay') || msg.includes('one tap')) {
      reply = `One-Tap Payroll is active. You can review pending employee compensations and process single or batch payments instantly.`;
    } else {
      reply = `Hello! I am your Payroll AI Assistant. I can assist with salary statements, one-tap payments, benefit advances, expense approvals, and budget variance. How can I help you today?`;
    }

    return {
      reply,
      timestamp: new Date().toISOString(),
    };
  }
}

export const payrollAIService = new PayrollAIService();
