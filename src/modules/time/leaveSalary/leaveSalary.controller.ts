import { Request, Response } from 'express';
import { leaveSalaryService } from './leaveSalary.service';

export class LeaveSalaryController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await leaveSalaryService.getAllLeaveSalaries(req.query);
      res.status(200).json({
        success: true,
        message: 'Leave salary encashments fetched successfully',
        data: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave salaries',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const record = await leaveSalaryService.getLeaveSalaryById(id);
      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Leave salary record not found',
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
        message: error.message || 'Failed to fetch leave salary record',
      });
    }
  }

  async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = await leaveSalaryService.getMetrics();
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave salary metrics',
      });
    }
  }

  async calculateEncashment(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, daysEncashing, leaveType } = req.body;
      const calculation = await leaveSalaryService.calculateEncashment(
        employeeId,
        Number(daysEncashing) || 0,
        leaveType
      );
      res.status(200).json({
        success: true,
        data: calculation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate encashment',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await leaveSalaryService.createLeaveSalary(req.body);
      res.status(201).json({
        success: true,
        message: 'Leave salary encashment created successfully',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create leave salary encashment',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await leaveSalaryService.updateLeaveSalary(id, req.body);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Leave salary record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Leave salary encashment updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update leave salary encashment',
      });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await leaveSalaryService.updateStatus(id, status);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Leave salary record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Leave salary encashment status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update leave salary status',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await leaveSalaryService.deleteLeaveSalary(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Leave salary record not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Leave salary encashment deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete leave salary encashment',
      });
    }
  }
}

export const leaveSalaryController = new LeaveSalaryController();
