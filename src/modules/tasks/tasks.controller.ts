import { Request, Response } from 'express';
import { tasksService } from './tasks.service';

export class TasksController {
  // --- KANBAN TASKS ---
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const result = await tasksService.getAllTasks(req.query);
      res.status(200).json({
        success: true,
        message: 'Tasks fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch tasks',
      });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await tasksService.getTaskById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch task',
      });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await tasksService.createTask(req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create task',
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const task = await tasksService.updateTask(id, req.body);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task',
      });
    }
  }

  async moveTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { column } = req.body;
      const task = await tasksService.moveTask(id, column);
      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Task moved to ${column}`,
        data: task,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to move task',
      });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await tasksService.deleteTask(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete task',
      });
    }
  }

  // --- TODOS ---
  async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      const result = await tasksService.getAllTodos(req.query);
      res.status(200).json({
        success: true,
        message: 'Todos fetched successfully',
        data: result.items,
        items: result.items,
        total: result.total,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch todos',
      });
    }
  }

  async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const todo = await tasksService.getTodoById(id);
      if (!todo) {
        res.status(404).json({
          success: false,
          message: 'Todo item not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch todo',
      });
    }
  }

  async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const todo = await tasksService.createTodo(req.body);
      res.status(201).json({
        success: true,
        message: 'Todo item created successfully',
        data: todo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create todo',
      });
    }
  }

  async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const todo = await tasksService.updateTodo(id, req.body);
      if (!todo) {
        res.status(404).json({
          success: false,
          message: 'Todo item not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Todo item updated successfully',
        data: todo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update todo',
      });
    }
  }

  async toggleTodo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { completed } = req.body;
      const todo = await tasksService.toggleTodo(id, completed);
      if (!todo) {
        res.status(404).json({
          success: false,
          message: 'Todo item not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Todo marked as ${todo.completed ? 'completed' : 'pending'}`,
        data: todo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to toggle todo status',
      });
    }
  }

  async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await tasksService.deleteTodo(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Todo item not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Todo item deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete todo',
      });
    }
  }
}

export const tasksController = new TasksController();
