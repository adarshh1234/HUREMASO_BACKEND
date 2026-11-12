import { Request, Response } from 'express';
import { timeReportService } from './timeReport.service';

export class TimeReportController {
  async getProjectReport(req: Request, res: Response): Promise<void> {
    try {
      const data = await timeReportService.getProjectReport(req.query);
      res.status(200).json({
        success: true,
        message: 'Project time report generated successfully',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate project report',
      });
    }
  }

  async getEmployeeReport(req: Request, res: Response): Promise<void> {
    try {
      const data = await timeReportService.getEmployeeReport(req.query);
      res.status(200).json({
        success: true,
        message: 'Employee time report generated successfully',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate employee report',
      });
    }
  }

  async getAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const data = await timeReportService.getAttendanceSummary(req.query);
      res.status(200).json({
        success: true,
        message: 'Attendance summary report generated successfully',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate attendance summary report',
      });
    }
  }
}

export const timeReportController = new TimeReportController();
