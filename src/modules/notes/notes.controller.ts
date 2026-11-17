import { Request, Response } from 'express';
import { notesService } from './notes.service';

function getStatusCode(error: any): number {
  if (error.statusCode) return error.statusCode;
  if (error.name === 'ValidationError' || error.name === 'CastError') return 400;
  return 500;
}

export class NotesController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await notesService.getAllNotes(req.query);
      res.status(200).json({
        success: true,
        message: 'Notes fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to fetch notes',
      });
    }
  }

  async getCategoryCounts(req: Request, res: Response): Promise<void> {
    try {
      const counts = await notesService.getCategoryCounts();
      res.status(200).json({
        success: true,
        data: counts,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to fetch category counts',
      });
    }
  }

  async getAllTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await notesService.getAllTags();
      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to fetch tags',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const note = await notesService.getNoteById(id);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to fetch note',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const note = await notesService.createNote(req.body);
      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to create note',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const note = await notesService.updateNote(id, req.body);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to update note',
      });
    }
  }

  async togglePin(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { pinned } = req.body || {};
      const note = await notesService.togglePin(id, pinned);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Note ${note.pinned ? 'pinned' : 'unpinned'} successfully`,
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to toggle pin status',
      });
    }
  }

  async updateChecklist(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { checklistItems } = req.body;
      const note = await notesService.updateChecklist(id, checklistItems);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Checklist updated successfully',
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to update checklist',
      });
    }
  }

  async toggleChecklistItem(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const itemId = req.params.itemId as string;
      const { completed } = req.body || {};
      const note = await notesService.toggleChecklistItem(id, itemId, completed);
      if (!note) {
        res.status(404).json({
          success: false,
          message: 'Note or checklist item not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Checklist item toggled successfully',
        data: note,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to toggle checklist item',
      });
    }
  }

  async aiSummarize(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await notesService.aiSummarize(id);
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'AI Summary generated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to generate AI summary',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await notesService.deleteNote(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Note not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error: any) {
      res.status(getStatusCode(error)).json({
        success: false,
        message: error.message || 'Failed to delete note',
      });
    }
  }
}

export const notesController = new NotesController();
