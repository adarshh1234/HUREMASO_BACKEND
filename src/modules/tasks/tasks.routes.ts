import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { validateRequest } from '../../common/middlewares/validateRequest';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  createTodoSchema,
  updateTodoSchema,
  toggleTodoSchema,
} from './tasks.validator';

const router = Router();

// --- TODOS (Must be mounted before /:id to avoid route collision) ---
router.get('/todos', (req, res) => tasksController.getAllTodos(req, res));
router.post('/todos', validateRequest(createTodoSchema), (req, res) => tasksController.createTodo(req, res));
router.get('/todos/:id', (req, res) => tasksController.getTodoById(req, res));
router.put('/todos/:id', validateRequest(updateTodoSchema), (req, res) => tasksController.updateTodo(req, res));
router.patch('/todos/:id/toggle', validateRequest(toggleTodoSchema), (req, res) => tasksController.toggleTodo(req, res));
router.delete('/todos/:id', (req, res) => tasksController.deleteTodo(req, res));

// --- KANBAN TASKS ---
router.get('/', (req, res) => tasksController.getAllTasks(req, res));
router.post('/', validateRequest(createTaskSchema), (req, res) => tasksController.createTask(req, res));
router.get('/:id', (req, res) => tasksController.getTaskById(req, res));
router.put('/:id', validateRequest(updateTaskSchema), (req, res) => tasksController.updateTask(req, res));
router.patch('/:id/move', validateRequest(moveTaskSchema), (req, res) => tasksController.moveTask(req, res));
router.delete('/:id', (req, res) => tasksController.deleteTask(req, res));

export const tasksRoutes = router;
export default router;
