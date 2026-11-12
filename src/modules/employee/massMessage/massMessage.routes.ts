import { Router } from 'express';
import { massMessageController } from './massMessage.controller';

const router = Router();

router
  .route('/recipients')
  .get(massMessageController.getRecipients);

router
  .route('/send')
  .post(massMessageController.sendMessage);

router
  .route('/history')
  .get(massMessageController.getHistory);

router
  .route('/history/:id')
  .delete(massMessageController.deleteHistory);

export default router;
