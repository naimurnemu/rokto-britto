import { registerUserWithEmail, loginUserWithEmail, continueWithGoogle, completeUserProfile, resetPasswordWithToken, registerOrLoginUser, getUserProfile, } from './auth.service';
/**
 * Functional RequestHandler: Register user with email and password
 */
export const registerWithEmailHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: { message: 'Both email and password are required.' },
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: { message: 'Password must be at least 6 characters long.' },
            });
            return;
        }
        const data = await registerUserWithEmail({ email, password });
        res.status(201).json({
            success: true,
            message: 'Account created successfully. Proceed to profile completion.',
            data,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Login user with email and password
 */
export const loginWithEmailHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: { message: 'Both email and password are required.' },
            });
            return;
        }
        const data = await loginUserWithEmail({ email, password });
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Continue with Google OAuth
 */
export const continueWithGoogleHandler = async (req, res, next) => {
    try {
        const { email, name, googleId } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                error: { message: 'Google account email is required.' },
            });
            return;
        }
        const data = await continueWithGoogle({ email, name, googleId });
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Completes user profile (dob, gender, hemoglobin, profession, location)
 */
export const completeProfileHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.body.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: { message: 'Unauthorized or userId missing.' },
            });
            return;
        }
        const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, hemoglobin, profession, locationType, address, latitude, longitude, isDonorAvailable, } = req.body;
        if (!firstName || !lastName || !dateOfBirth || !gender || !bloodGroup || !profession) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'First Name, Last Name, Date of Birth, Gender, Blood Group, and Profession are required.',
                },
            });
            return;
        }
        const updatedUser = await completeUserProfile({
            userId,
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            bloodGroup,
            hemoglobin: hemoglobin !== undefined && hemoglobin !== null ? Number(hemoglobin) : undefined,
            profession,
            locationType: locationType || 'MANUAL',
            address,
            latitude: latitude !== undefined ? Number(latitude) : undefined,
            longitude: longitude !== undefined ? Number(longitude) : undefined,
            isDonorAvailable: Boolean(isDonorAvailable),
        });
        res.status(200).json({
            success: true,
            message: 'Profile completed successfully.',
            data: updatedUser,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Set or reset password using security token
 */
export const resetPasswordHandler = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({
                success: false,
                error: { message: 'Reset token and new password are required.' },
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                error: { message: 'Password must be at least 6 characters long.' },
            });
            return;
        }
        const result = await resetPasswordWithToken({ token, newPassword });
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Legacy session creation (phone/email compatibility)
 */
export const registerOrLoginHandler = async (req, res, next) => {
    try {
        const { phone, email, fullName, bloodGroup, role, agencyId, permissions, latitude, longitude } = req.body;
        if (!phone && !email) {
            res.status(400).json({
                success: false,
                error: { message: 'Phone or email is required.' },
            });
            return;
        }
        const data = await registerOrLoginUser({
            phone,
            email,
            fullName,
            bloodGroup,
            role,
            agencyId,
            permissions,
            latitude,
            longitude,
        });
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
/**
 * Functional RequestHandler: Retrieves profile for authenticated user
 */
export const getProfileHandler = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
            return;
        }
        const user = await getUserProfile(userId);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({
                success: false,
                error: { message: error.message },
            });
            return;
        }
        next(error);
    }
};
// Compatibility export
export const authController = {
    registerWithEmail: registerWithEmailHandler,
    loginWithEmail: loginWithEmailHandler,
    continueWithGoogle: continueWithGoogleHandler,
    completeProfile: completeProfileHandler,
    resetPassword: resetPasswordHandler,
    registerOrLogin: registerOrLoginHandler,
    getProfile: getProfileHandler,
};
