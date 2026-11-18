import { Router } from 'express';
import { configurationController } from './config.controller';

const router = Router();

router.route('/')
  .get(configurationController.getConfiguration)
  .put(configurationController.updateConfiguration);

router.post('/test-email', configurationController.testEmail);
router.post('/test-ldap', configurationController.testLdap);

export default router;
