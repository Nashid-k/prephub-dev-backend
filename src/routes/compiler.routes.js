import express from 'express';
import compilerController from '../controllers/compiler.controller.js';

import { compilerLimiter } from '../middleware/security.js';
import { validateCodeExecution } from '../middleware/validation.js';

const router = express.Router();

import { optionalProtect } from '../middleware/auth.js';

// Apply compiler-specific rate limiting
router.use(compilerLimiter);

// Compiler endpoints
router.get('/languages', compilerController.getLanguages);
router.post('/execute', optionalProtect, validateCodeExecution, compilerController.executeCode);

export default router;
