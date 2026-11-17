import { TaskModel, TodoModel } from './tasks.model';
import {
  ITaskDocument,
  ITodoDocument,
  TaskQueryParams,
  TodoQueryParams,
  TaskCountsSummary,
  TodoStatsSummary,
} from './tasks.types';

export class TasksRepository {
  // ================= KANBAN TASKS =================
  async createTask(data: Partial<ITaskDocument>): Promise<ITaskDocument> {
    const item = new TaskModel(data);
    return (await item.save()).populate('assigneeId');
  }

  async findTaskById(id: string): Promise<ITaskDocument | null> {
    return TaskModel.findById(id).populate('assigneeId');
  }

  async updateTask(id: string, data: Partial<ITaskDocument>): Promise<ITaskDocument | null> {
    const updatePayload: any = { ...data };
    if (data.column === 'completed') {
      updatePayload.completedAt = new Date();
    } else if (data.column) {
      updatePayload.completedAt = null;
    }

    return TaskModel.findByIdAndUpdate(id, { $set: updatePayload }, { new: true }).populate('assigneeId');
  }

  async deleteTask(id: string): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndDelete(id);
  }

  async findAllTasks(params: TaskQueryParams): Promise<{ items: ITaskDocument[]; total: number }> {
    const query: any = {};

    if (params.search && params.search.trim() !== '') {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { type: searchRegex },
        { assigneeName: searchRegex },
      ];
    }

    if (params.column) {
      query.column = params.column;
    }

    if (params.type && params.type.toLowerCase() !== 'all') {
      query.type = { $regex: `^${params.type.trim()}$`, $options: 'i' };
    }

    if (params.priority && params.priority.toLowerCase() !== 'all') {
      query.priority = { $regex: `^${params.priority.trim()}$`, $options: 'i' };
    }

    if (params.assigneeId) {
      query.assigneeId = params.assigneeId;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 100));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      TaskModel.find(query)
        .populate('assigneeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      TaskModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getTaskCounts(): Promise<TaskCountsSummary> {
    const [total, newTask, scheduled, inProgress, completed] = await Promise.all([
      TaskModel.countDocuments(),
      TaskModel.countDocuments({ column: 'new-task' }),
      TaskModel.countDocuments({ column: 'scheduled' }),
      TaskModel.countDocuments({ column: 'in-progress' }),
      TaskModel.countDocuments({ column: 'completed' }),
    ]);

    return {
      total,
      newTask,
      scheduled,
      inProgress,
      completed,
    };
  }

  async seedDefaultTasksIfEmpty(): Promise<void> {
    const count = await TaskModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<ITaskDocument>[] = [
        {
          title: 'Prepare Calculus quiz questions',
          column: 'new-task',
          type: 'Operational',
          priority: 'Medium',
          dueDate: 'Dec 18',
          description: 'Draft 15 advanced integration and differential equations problem sets.',
          assigneeName: 'Elena Rostova',
        },
        {
          title: 'Draft syllabus for Quantum Physics',
          column: 'new-task',
          type: 'Technical',
          priority: 'High',
          dueDate: 'Dec 20',
          description: 'Coordinate with department heads on wave mechanics syllabus.',
          assigneeName: 'Marcus Vance',
        },
        {
          title: 'Verify Aisha Kumar Background PCC Documents',
          column: 'new-task',
          type: 'Hiring',
          priority: 'Urgent',
          dueDate: 'Dec 15',
          description: 'Review police clearance certificates and education credential audits.',
          assigneeName: 'Sarah Joseph',
        },
        {
          title: 'Review term exams schedule',
          column: 'scheduled',
          type: 'Strategic',
          priority: 'Medium',
          dueDate: 'Dec 22',
          description: 'Audit auditorium venue allocations and invigilator rosters.',
          assigneeName: 'Carlos Gomez',
        },
        {
          title: 'Schedule Q3 All-Hands Townhall Meeting',
          column: 'scheduled',
          type: 'Operational',
          priority: 'High',
          dueDate: 'Dec 24',
          description: 'Set up executive Zoom broadcast and stream logistics.',
          assigneeName: 'Alexander Wright',
        },
        {
          title: 'Onboard new math co-teacher',
          column: 'in-progress',
          type: 'Hiring',
          priority: 'High',
          dueDate: 'Dec 19',
          description: 'Complete IT provisioning and LMS curriculum orientation.',
          assigneeName: 'Sarah Joseph',
        },
        {
          title: 'Draft Executive Severance Letter for Restructure',
          column: 'in-progress',
          type: 'Financial',
          priority: 'Urgent',
          dueDate: 'Dec 16',
          description: 'Prepare severance agreement adhering strictly to labor statutory formulas.',
          assigneeName: 'Michael Chang',
        },
        {
          title: 'Submit Q3 budget analysis',
          column: 'completed',
          type: 'Financial',
          priority: 'High',
          dueDate: 'Dec 10',
          completedAt: new Date('2026-12-10T16:00:00Z'),
          description: 'Consolidated departmental spending vs Q3 allocated budgets.',
          assigneeName: 'Elena Rostova',
        },
        {
          title: 'Complete Employee App Travel Documents Feature Test',
          column: 'completed',
          type: 'Technical',
          priority: 'Medium',
          dueDate: 'Dec 12',
          completedAt: new Date('2026-12-12T14:30:00Z'),
          description: 'End-to-end flight booking ticket voucher upload testing.',
          assigneeName: 'Marcus Vance',
        },
      ];
      await TaskModel.insertMany(defaults);
    }
  }

  // ================= TODOS =================
  async createTodo(data: Partial<ITodoDocument>): Promise<ITodoDocument> {
    const item = new TodoModel(data);
    return (await item.save()).populate('employeeId');
  }

  async findTodoById(id: string): Promise<ITodoDocument | null> {
    return TodoModel.findById(id).populate('employeeId');
  }

  async updateTodo(id: string, data: Partial<ITodoDocument>): Promise<ITodoDocument | null> {
    const updatePayload: any = { ...data };
    if (data.completed === true) {
      updatePayload.completedAt = new Date();
    } else if (data.completed === false) {
      updatePayload.completedAt = null;
    }

    return TodoModel.findByIdAndUpdate(id, { $set: updatePayload }, { new: true }).populate('employeeId');
  }

  async deleteTodo(id: string): Promise<ITodoDocument | null> {
    return TodoModel.findByIdAndDelete(id);
  }

  async findAllTodos(params: TodoQueryParams): Promise<{ items: ITodoDocument[]; total: number }> {
    const query: any = {};

    if (params.search && params.search.trim() !== '') {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    if (params.category && params.category.toLowerCase() !== 'all') {
      query.category = { $regex: `^${params.category.trim()}$`, $options: 'i' };
    }

    if (params.completed !== undefined) {
      query.completed = params.completed === true || params.completed === 'true';
    }

    if (params.priority && params.priority.toLowerCase() !== 'all') {
      query.priority = { $regex: `^${params.priority.trim()}$`, $options: 'i' };
    }

    if (params.employeeId) {
      query.employeeId = params.employeeId;
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(params.limit) || 100));
    const skip = (page - 1) * limit;

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      TodoModel.find(query)
        .populate('employeeId')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      TodoModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async getTodoStats(employeeId?: string): Promise<TodoStatsSummary> {
    const query: any = {};
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const [total, completed] = await Promise.all([
      TodoModel.countDocuments(query),
      TodoModel.countDocuments({ ...query, completed: true }),
    ]);

    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      percentage,
    };
  }

  async seedDefaultTodosIfEmpty(): Promise<void> {
    const count = await TodoModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<ITodoDocument>[] = [
        {
          title: 'Approve September Monthly Payroll OneTap Disbursement',
          category: 'Payroll',
          completed: true,
          completedAt: new Date('2026-09-01T09:00:00Z'),
          dueDate: 'Today',
          priority: 'High',
          description: 'Review banking WPS batch file and sign off salary release.',
        },
        {
          title: 'Conduct Exit Interview for Senior Frontend Engineer',
          category: 'Off-Boarding',
          completed: false,
          dueDate: 'Tomorrow',
          priority: 'Medium',
          description: 'Standard HR exit questionnaire and asset handover debrief.',
        },
        {
          title: 'Issue Repatriation Flight Ticket Voucher',
          category: 'Off-Boarding',
          completed: false,
          dueDate: 'Sept 06',
          priority: 'High',
          description: 'Coordinate travel desk flight ticket voucher for departing employee.',
        },
        {
          title: 'Publish Q3 Internal HR Newsletter & Events Schedule',
          category: 'Events',
          completed: true,
          completedAt: new Date('2026-08-31T15:00:00Z'),
          dueDate: 'Aug 31',
          priority: 'Normal',
          description: 'Broadcast townhall dates and wellness webinars to all staff.',
        },
        {
          title: 'Audit YubiKey Hardware Security Token Distribution',
          category: 'Compliance',
          completed: true,
          completedAt: new Date('2026-08-28T11:00:00Z'),
          dueDate: 'Aug 28',
          priority: 'Urgent',
          description: 'Reconcile serial numbers for hardware 2FA keys issued to remote engineers.',
        },
      ];
      await TodoModel.insertMany(defaults);
    }
  }
}

export const tasksRepository = new TasksRepository();
