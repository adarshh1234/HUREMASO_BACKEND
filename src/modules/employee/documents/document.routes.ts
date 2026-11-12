import { Router } from 'express';
import { documentController } from './document.controller';

const router = Router();

// Folders
router
  .route('/folders')
  .get(documentController.getFolders)
  .post(documentController.createFolder);

router
  .route('/folders/:id')
  .delete(documentController.deleteFolder);

// Documents
router
  .route('/')
  .get(documentController.getDocuments)
  .post(documentController.createDocument);

router
  .route('/:id')
  .get(documentController.getDocumentById)
  .patch(documentController.updateDocument)
  .delete(documentController.deleteDocument);

export default router;
