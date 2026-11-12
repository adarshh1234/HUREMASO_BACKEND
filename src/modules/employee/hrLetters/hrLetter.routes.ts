import { Router } from 'express';
import { hrLetterController } from './hrLetter.controller';

const router = Router();

// ==========================================
// TEMPLATES
// ==========================================
router
  .route('/templates')
  .get(hrLetterController.getTemplates)
  .post(hrLetterController.createTemplate);

router
  .route('/templates/:id')
  .get(hrLetterController.getTemplateById)
  .put(hrLetterController.updateTemplate)
  .delete(hrLetterController.deleteTemplate);

// ==========================================
// DYNAMIC GENERATION
// ==========================================
router
  .route('/generate')
  .post(hrLetterController.generateLetter);

router
  .route('/records/generate')
  .post(hrLetterController.generateLetter);

// ==========================================
// ISSUED LETTER RECORDS
// ==========================================
router
  .route('/records')
  .get(hrLetterController.getRecords)
  .post(hrLetterController.createRecord);

router
  .route('/records/:id')
  .get(hrLetterController.getRecordById)
  .put(hrLetterController.updateRecord)
  .delete(hrLetterController.deleteRecord);

// ==========================================
// COMMUNICATIONS (MEMOS, NOTICES, CIRCULARS, LETTERS)
// ==========================================
router
  .route('/communications')
  .get(hrLetterController.getCommunications)
  .post(hrLetterController.createCommunication);

router
  .route('/communications/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/communications/:id/status')
  .patch(hrLetterController.updateCommunicationStatus);

router
  .route('/communications/:id/publish')
  .post(hrLetterController.updateCommunicationStatus)
  .put(hrLetterController.updateCommunicationStatus)
  .patch(hrLetterController.updateCommunicationStatus);

// ==========================================
// DEDICATED TYPE ROUTES (MEMOS, NOTICES, CIRCULARS, LETTERS)
// ==========================================
router
  .route('/memos')
  .get(hrLetterController.getMemos)
  .post(hrLetterController.createMemo);

router
  .route('/memos/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/notices')
  .get(hrLetterController.getNotices)
  .post(hrLetterController.createNotice);

router
  .route('/notices/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/circulars')
  .get(hrLetterController.getCirculars)
  .post(hrLetterController.createCircular);

router
  .route('/circulars/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/letters')
  .get(hrLetterController.getLetters)
  .post(hrLetterController.createLetter);

router
  .route('/letters/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

export default router;
