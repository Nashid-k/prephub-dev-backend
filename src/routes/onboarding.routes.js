import express from 'express';
import { checkUsername, completeOnboarding, getOnboardingStatus } from '../controllers/onboarding.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Check username availability (no auth required for checking)
router.post('/check-username', checkUsername);

// Complete onboarding (auth required)
router.post('/complete', protect, completeOnboarding);

// Get onboarding status (auth required)
router.get('/status', protect, getOnboardingStatus);

export default router;
