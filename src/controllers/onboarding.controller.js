import User from '../models/User.js';

/**
 * Check if username is available
 */
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                available: false,
                message: 'Username is required'
            });
        }

        // Validate format
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                available: false,
                message: 'Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens'
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({
            username: username.toLowerCase()
        });

        if (existingUser) {
            return res.json({
                available: false,
                message: 'Username is already taken'
            });
        }

        res.json({
            available: true,
            message: 'Username is available!'
        });

    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            available: false,
            message: 'Server error checking username'
        });
    }
};

/**
 * Complete onboarding - save user profile data
 */
export const completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { username, firstName, lastName, goals, skills } = req.body;

        // Validate required fields
        if (!username || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Username, first name, and last name are required'
            });
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username format'
            });
        }

        // Check username availability again
        const existingUser = await User.findOne({
            username: username.toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        // Validate goals
        const validGoals = ['practice', 'placements', 'interviews', 'learn', 'portfolio'];
        const filteredGoals = (goals || []).filter(g => validGoals.includes(g));

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username: username.toLowerCase(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                goals: filteredGoals,
                skills: skills || [],
                onboardingCompleted: true
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Onboarding completed successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                picture: updatedUser.picture,
                goals: updatedUser.goals,
                skills: updatedUser.skills,
                onboardingCompleted: updatedUser.onboardingCompleted
            }
        });

    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error completing onboarding'
        });
    }
};

/**
 * Get onboarding status
 */
export const getOnboardingStatus = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const user = await User.findById(userId).select('onboardingCompleted username firstName lastName goals skills').lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            onboardingCompleted: user.onboardingCompleted || false,
            profile: {
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                goals: user.goals,
                skills: user.skills
            }
        });

    } catch (error) {
        console.error('Get onboarding status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export default {
    checkUsername,
    completeOnboarding,
    getOnboardingStatus
};
