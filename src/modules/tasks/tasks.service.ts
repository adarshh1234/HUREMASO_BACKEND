import { tasksRepository, TasksRepository } from './tasks.repository';
import {
  CreateTaskDTO,
  CreateTodoDTO,
  ITask,
  ITodo,
  TaskColumn,
  TaskQueryParams,
  TodoQueryParams,
  TaskCountsSummary,
  TodoStatsSummary,
} from './tasks.types';
import { EmployeeModel } from '../employee/employee.model';

export class TasksService {
  private repository: TasksRepository;

  constructor() {
    this.repository = tasksRepository;
  }

  // ================= KANBAN TASKS =================
  async getAllTasks(params: TaskQueryParams): Promise<{ items: ITask[]; total: number }> {
    await this.repository.seedDefaultTasksIfEmpty();
    const res = await this.repository.findAllTasks(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as ITask),
      total: res.total,
    };
  }

  async getTaskById(id: string): Promise<ITask | null> {
    const doc = await this.repository.findTaskById(id);
    return doc ? (doc.toObject() as unknown as ITask) : null;
  }

  async createTask(dto: CreateTaskDTO): Promise<ITask> {
    let assigneeName = dto.assigneeName;
    let assigneeId = dto.assigneeId;
    let assigneeAvatar = dto.assigneeAvatar;

    if (assigneeId) {
      const emp = await EmployeeModel.findById(assigneeId);
      if (emp) {
        assigneeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
        assigneeAvatar = emp.avatar || assigneeAvatar;
      } else {
        assigneeId = undefined;
      }
    }

    const doc = await this.repository.createTask({
      title: dto.title,
      type: dto.type || 'Operational',
      dueDate: dto.dueDate,
      startDate: dto.startDate,
      column: dto.column || 'new-task',
      description: dto.description,
      priority: dto.priority || 'Medium',
      assigneeId: assigneeId as any,
      assigneeName,
      assigneeAvatar,
      createdBy: dto.createdBy || 'HR Operations',
    });

    return doc.toObject() as unknown as ITask;
  }

  async updateTask(id: string, dto: Partial<CreateTaskDTO>): Promise<ITask | null> {
    let updateData: any = { ...dto };

    if (dto.assigneeId) {
      const emp = await EmployeeModel.findById(dto.assigneeId);
      if (emp) {
        updateData.assigneeName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name;
        updateData.assigneeAvatar = emp.avatar;
      }
    }

    const doc = await this.repository.updateTask(id, updateData);
    return doc ? (doc.toObject() as unknown as ITask) : null;
  }

  async moveTask(id: string, column: TaskColumn): Promise<ITask | null> {
    const doc = await this.repository.updateTask(id, { column });
    return doc ? (doc.toObject() as unknown as ITask) : null;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = await this.repository.deleteTask(id);
    return !!deleted;
  }

  async getTaskCounts(): Promise<TaskCountsSummary> {
    await this.repository.seedDefaultTasksIfEmpty();
    return this.repository.getTaskCounts();
  }

  // ================= TODOS =================
  async getAllTodos(params: TodoQueryParams): Promise<{ items: ITodo[]; total: number }> {
    await this.repository.seedDefaultTodosIfEmpty();
    const res = await this.repository.findAllTodos(params);
    return {
      items: res.items.map((doc) => doc.toObject() as unknown as ITodo),
      total: res.total,
    };
  }

  async getTodoById(id: string): Promise<ITodo | null> {
    const doc = await this.repository.findTodoById(id);
    return doc ? (doc.toObject() as unknown as ITodo) : null;
  }

  async createTodo(dto: CreateTodoDTO): Promise<ITodo> {
    let employeeId = dto.employeeId;
    if (employeeId) {
      const emp = await EmployeeModel.findById(employeeId);
      if (!emp) {
        employeeId = undefined;
      }
    }

    const doc = await this.repository.createTodo({
      title: dto.title,
      category: dto.category || 'General',
      completed: dto.completed ?? false,
      dueDate: dto.dueDate || 'Today',
      priority: dto.priority || 'Normal',
      description: dto.description,
      employeeId: employeeId as any,
    });

    return doc.toObject() as unknown as ITodo;
  }

  async updateTodo(id: string, dto: Partial<CreateTodoDTO>): Promise<ITodo | null> {
    const doc = await this.repository.updateTodo(id, dto as any);
    return doc ? (doc.toObject() as unknown as ITodo) : null;
  }

  async toggleTodo(id: string, completed?: boolean): Promise<ITodo | null> {
    const existing = await this.repository.findTodoById(id);
    if (!existing) return null;

    const nextCompleted = completed !== undefined ? completed : !existing.completed;
    const doc = await this.repository.updateTodo(id, { completed: nextCompleted });
    return doc ? (doc.toObject() as unknown as ITodo) : null;
  }

  async deleteTodo(id: string): Promise<boolean> {
    const deleted = await this.repository.deleteTodo(id);
    return !!deleted;
  }

  async getTodoStats(employeeId?: string): Promise<TodoStatsSummary> {
    await this.repository.seedDefaultTodosIfEmpty();
    return this.repository.getTodoStats(employeeId);
  }
}

export const tasksService = new TasksService();
