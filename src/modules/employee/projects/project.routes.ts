import { Router } from 'express';
import { projectController } from './project.controller';

const router = Router();

// Customers
router
  .route('/customers')
  .get(projectController.getCustomers)
  .post(projectController.createCustomer);

router
  .route('/customers/:id')
  .put(projectController.updateCustomer)
  .delete(projectController.deleteCustomer);

// Projects
router
  .route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router
  .route('/:id')
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

export default router;
