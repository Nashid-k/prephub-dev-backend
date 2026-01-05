import express from 'express';
import { checkUsername, completeOnboarding, getOnboardingStatus } from '../controllers/onboarding.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Check username availability (no auth required for checking)
router.post('/check-username', checkUsername);

// Complete onboarding (auth required)
router.post('/complete', authMiddleware, completeOnboarding);

// Get onboarding status (auth required)
router.get('/status', authMiddleware, getOnboardingStatus);

export default router;
