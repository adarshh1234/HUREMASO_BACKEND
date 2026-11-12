import { Request, Response } from 'express';
import { timePayrollService } from './timePayroll.service';

export class TimePayrollController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await timePayrollService.getAllTimePayrolls(req.query);
      res.status(200).json({
        success: true,
        message: 'Time payroll records fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch time payroll records',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const record = await timePayrollService.getTimePayrollById(id);
      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Time payroll record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch time payroll record',
      });
    }
  }

  async getSummary(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await timePayrollService.getSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch time payroll summary',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await timePayrollService.createTimePayroll(req.body);
      res.status(201).json({
        success: true,
        message: 'Time payroll record created successfully',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create time payroll record',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await timePayrollService.updateTimePayroll(id, req.body);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Time payroll record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Time payroll record updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update time payroll record',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await timePayrollService.deleteTimePayroll(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Time payroll record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Time payroll record deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete time payroll record',
      });
    }
  }

  async calculate(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.body;
      const result = await timePayrollService.calculateTimePayrollForPeriod(month);
      res.status(200).json({
        success: true,
        message: `Calculated time payroll for ${result.processed} employees`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate time payroll',
      });
    }
  }

  async exportFeed(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string;
      const feed = await timePayrollService.exportFeed(month);
      res.status(200).json({
        success: true,
        message: 'Time payroll export feed generated successfully',
        data: feed,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export time payroll feed',
      });
    }
  }
}

export const timePayrollController = new TimePayrollController();
