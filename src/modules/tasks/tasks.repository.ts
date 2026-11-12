import { TaskModel, TodoModel } from './tasks.model';
import { ITaskDocument, ITodoDocument, TaskQueryParams, TodoQueryParams } from './tasks.types';

export class TasksRepository {
  // --- KANBAN TASKS ---
  async createTask(data: Partial<ITaskDocument>): Promise<ITaskDocument> {
    const item = new TaskModel(data);
    return (await item.save()).populate('assigneeId');
  }

  async findTaskById(id: string): Promise<ITaskDocument | null> {
    return TaskModel.findById(id).populate('assigneeId');
  }

  async updateTask(id: string, data: Partial<ITaskDocument>): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('assigneeId');
  }

  async deleteTask(id: string): Promise<ITaskDocument | null> {
    return TaskModel.findByIdAndDelete(id);
  }

  async findAllTasks(params: TaskQueryParams): Promise<{ items: ITaskDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { type: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.column) {
      query.column = params.column;
    }

    if (params.type) {
      query.type = { $regex: `^${params.type}$`, $options: 'i' };
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

  async seedDefaultTasksIfEmpty(): Promise<void> {
    const count = await TaskModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<ITaskDocument>[] = [
        { title: 'Prepare Calculus quiz questions', column: 'new-task', type: 'Operational' },
        { title: 'Draft syllabus for Quantum Physics', column: 'new-task', type: 'Technical' },
        { title: 'Verify Aisha Kumar Background PCC Documents', column: 'new-task', type: 'Hiring' },
        { title: 'Review term exams schedule', column: 'scheduled', type: 'Strategic' },
        { title: 'Schedule Q3 All-Hands Townhall Meeting', column: 'scheduled', type: 'Operational' },
        { title: 'Onboard new math co-teacher', column: 'in-progress', type: 'Hiring' },
        { title: 'Draft Executive Severance Letter for Restructure', column: 'in-progress', type: 'Financial' },
        { title: 'Submit Q3 budget analysis', column: 'completed', type: 'Financial' },
        { title: 'Complete Employee App Travel Documents Feature Test', column: 'completed', type: 'Technical' },
      ];
      await TaskModel.insertMany(defaults);
    }
  }

  // --- TODOS ---
  async createTodo(data: Partial<ITodoDocument>): Promise<ITodoDocument> {
    const item = new TodoModel(data);
    return (await item.save()).populate('employeeId');
  }

  async findTodoById(id: string): Promise<ITodoDocument | null> {
    return TodoModel.findById(id).populate('employeeId');
  }

  async updateTodo(id: string, data: Partial<ITodoDocument>): Promise<ITodoDocument | null> {
    return TodoModel.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('employeeId');
  }

  async deleteTodo(id: string): Promise<ITodoDocument | null> {
    return TodoModel.findByIdAndDelete(id);
  }

  async findAllTodos(params: TodoQueryParams): Promise<{ items: ITodoDocument[]; total: number }> {
    const query: any = {};

    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { category: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.category) {
      query.category = { $regex: params.category, $options: 'i' };
    }

    if (params.completed !== undefined) {
      query.completed = params.completed === true || params.completed === 'true';
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

  async seedDefaultTodosIfEmpty(): Promise<void> {
    const count = await TodoModel.countDocuments();
    if (count === 0) {
      const defaults: Partial<ITodoDocument>[] = [
        { title: 'Approve September Monthly Payroll OneTap Disbursement', category: 'Payroll', completed: true, dueDate: 'Today' },
        { title: 'Conduct Exit Interview for Senior Frontend Engineer', category: 'Off-Boarding', completed: false, dueDate: 'Tomorrow' },
        { title: 'Issue Repatriation Flight Ticket Voucher', category: 'Off-Boarding', completed: false, dueDate: 'Sept 06' },
        { title: 'Publish Q3 Internal HR Newsletter & Events Schedule', category: 'Events', completed: true, dueDate: 'Aug 31' },
        { title: 'Audit YubiKey Hardware Security Token Distribution', category: 'Compliance', completed: true, dueDate: 'Aug 28' },
      ];
      await TodoModel.insertMany(defaults);
    }
  }
}

export const tasksRepository = new TasksRepository();
