import { Router } from 'express';
import { payrollAIController } from './payrollAI.controller';

const router = Router();

router.post('/chat', payrollAIController.chat);

export default router;
