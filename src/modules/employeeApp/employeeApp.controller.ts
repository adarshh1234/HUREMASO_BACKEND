import { Request, Response } from 'express';
import { employeeAppService } from './employeeApp.service';

export class EmployeeAppController {
  // Stats
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await employeeAppService.getStats();
      res.status(200).json({
        success: true,
        message: 'Employee App stats fetched successfully',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee app statistics',
      });
    }
  }

  // Users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await employeeAppService.getAppUsers(req.query);
      res.status(200).json({
        success: true,
        message: 'Employee app users fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee app users',
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await employeeAppService.getAppUserById(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch app user' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const created = await employeeAppService.createAppUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee app user registered successfully',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to register app user' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await employeeAppService.updateAppUser(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'App user updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update app user' });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;
      const updated = await employeeAppService.toggleUserStatus(id, status, notes);
      if (!updated) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: `App user status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to toggle app user status' });
    }
  }

  async updatePermissions(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { permissions, role } = req.body;
      const updated = await employeeAppService.updateUserPermissions(id, permissions, role);
      if (!updated) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'App user permissions updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update permissions' });
    }
  }

  async resetDevice(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const updated = await employeeAppService.resetDeviceBinding(id, reason);
      if (!updated) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Device unlinked and binding reset successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to reset device binding' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await employeeAppService.deleteAppUser(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'App user not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'App user deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete app user' });
    }
  }

  // Announcements
  async getAllAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const result = await employeeAppService.getAnnouncements(req.query);
      res.status(200).json({
        success: true,
        message: 'Announcements fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch announcements' });
    }
  }

  async getAnnouncementById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const announcement = await employeeAppService.getAnnouncementById(id);
      if (!announcement) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }
      res.status(200).json({ success: true, data: announcement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch announcement' });
    }
  }

  async createAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const created = await employeeAppService.createAnnouncement(req.body);
      res.status(201).json({
        success: true,
        message: 'App announcement created and dispatched successfully',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create announcement' });
    }
  }

  async updateAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updated = await employeeAppService.updateAnnouncement(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Announcement updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update announcement' });
    }
  }

  async deleteAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await employeeAppService.deleteAnnouncement(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete announcement' });
    }
  }

  // Requests
  async getAllRequests(req: Request, res: Response): Promise<void> {
    try {
      const result = await employeeAppService.getRequests(req.query);
      res.status(200).json({
        success: true,
        message: 'Employee app requests fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch requests' });
    }
  }

  async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const request = await employeeAppService.getRequestById(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      res.status(200).json({ success: true, data: request });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch request' });
    }
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const created = await employeeAppService.createRequest(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee app request submitted successfully',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to submit request' });
    }
  }

  async updateRequestStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, reviewNotes, reviewedBy } = req.body;
      const updated = await employeeAppService.updateRequestStatus(id, status, reviewNotes, reviewedBy);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Request status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update request status' });
    }
  }

  // Activity Logs
  async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const result = await employeeAppService.getActivityLogs(req.query);
      res.status(200).json({
        success: true,
        message: 'Activity logs fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch activity logs' });
    }
  }

  // Settings
  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await employeeAppService.getSettings();
      res.status(200).json({
        success: true,
        message: 'App configuration settings fetched successfully',
        data: settings,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch app settings' });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const updated = await employeeAppService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'App settings updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update app settings' });
    }
  }
}

export const employeeAppController = new EmployeeAppController();
