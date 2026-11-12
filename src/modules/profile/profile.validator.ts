import { z } from 'zod';

// ─── Update Profile ─────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  nickname: z.string().max(50).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().max(30).trim().optional(),
  birthday: z.string().max(50).trim().optional(),
  gender: z.string().max(30).trim().optional(),
  avatarText: z.string().max(3).trim().optional(),
});

// ─── Change Password ────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// ─── Update Preferences ─────────────────────────────────────────────────────
export const updatePreferencesSchema = z.object({
  activityControls: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(['On', 'Off', 'Paused']),
      })
    )
    .optional(),
  businessPersonalization: z.boolean().optional(),
  adPersonalization: z.boolean().optional(),
  language: z.string().max(50).optional(),
});

// ─── Update Security ────────────────────────────────────────────────────────
export const updateSecuritySchema = z.object({
  twoStepVerification: z.boolean().optional(),
  lessSecureApps: z.boolean().optional(),
  phoneSignIn: z.boolean().optional(),
});

// ─── Notification param ─────────────────────────────────────────────────────
export const notifIdParamSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
});
