import { Router } from 'express';
import { hrLetterController } from './hrLetter.controller';
import { authMiddleware } from '../../../common/middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to enrich user context
router.use(authMiddleware);

// ==========================================
// 1. STATS & METRICS
// ==========================================
router.get('/stats', hrLetterController.getStatsSummary);
router.get('/counts', hrLetterController.getStatsSummary);

// ==========================================
// 2. AI ASSISTED DRAFTING
// ==========================================
router.post('/ai/draft', hrLetterController.generateAIDraft);
router.post('/draft', hrLetterController.generateAIDraft);

// ==========================================
// 3. DYNAMIC PDF GENERATION
// ==========================================
router.post('/generate-pdf', hrLetterController.generateDynamicPDF);

// ==========================================
// 4. TEMPLATES
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
// 5. DYNAMIC LETTER GENERATION FROM TEMPLATE
// ==========================================
router.post('/generate', hrLetterController.generateLetter);
router.post('/records/generate', hrLetterController.generateLetter);

// ==========================================
// 6. ISSUED LETTER RECORDS
// ==========================================
router
  .route('/records')
  .get(hrLetterController.getRecords)
  .post(hrLetterController.createRecord);

router.get('/records/:id/pdf', hrLetterController.getRecordPDF);

router
  .route('/records/:id')
  .get(hrLetterController.getRecordById)
  .put(hrLetterController.updateRecord)
  .delete(hrLetterController.deleteRecord);

// ==========================================
// 7. COMMUNICATIONS (MEMOS, NOTICES, CIRCULARS, LETTERS)
// ==========================================
router
  .route('/communications')
  .get(hrLetterController.getCommunications)
  .post(hrLetterController.createCommunication);

router.get('/communications/:id/pdf', hrLetterController.getCommunicationPDF);

router
  .route('/communications/:id/status')
  .patch(hrLetterController.updateCommunicationStatus)
  .put(hrLetterController.updateCommunicationStatus);

router
  .route('/communications/:id/publish')
  .post(hrLetterController.updateCommunicationStatus)
  .put(hrLetterController.updateCommunicationStatus)
  .patch(hrLetterController.updateCommunicationStatus);

router
  .route('/communications/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

// ==========================================
// 8. DEDICATED TYPE ROUTES (MEMOS, NOTICES, CIRCULARS, LETTERS)
// ==========================================
router
  .route('/memos')
  .get(hrLetterController.getMemos)
  .post(hrLetterController.createMemo);

router.get('/memos/:id/pdf', hrLetterController.getCommunicationPDF);

router
  .route('/memos/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/notices')
  .get(hrLetterController.getNotices)
  .post(hrLetterController.createNotice);

router.get('/notices/:id/pdf', hrLetterController.getCommunicationPDF);

router
  .route('/notices/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/circulars')
  .get(hrLetterController.getCirculars)
  .post(hrLetterController.createCircular);

router.get('/circulars/:id/pdf', hrLetterController.getCommunicationPDF);

router
  .route('/circulars/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

router
  .route('/letters')
  .get(hrLetterController.getLetters)
  .post(hrLetterController.createLetter);

router.get('/letters/:id/pdf', hrLetterController.getCommunicationPDF);

router
  .route('/letters/:id')
  .get(hrLetterController.getCommunicationById)
  .put(hrLetterController.updateCommunication)
  .delete(hrLetterController.deleteCommunication);

export default router;
