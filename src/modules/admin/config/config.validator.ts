import { z } from 'zod';

export const updateConfigurationSchema = z.object({
  emailConfig: z.record(z.any()).optional(),
  emailSubscriptions: z.record(z.any()).optional(),
  localization: z.record(z.any()).optional(),
  modules: z.record(z.any()).optional(),
  socialAuth: z.record(z.any()).optional(),
  oauthClients: z.any().optional(),
  ldapAuth: z.record(z.any()).optional(),
});

export const testEmailSchema = z.object({
  sendAsEmail: z.string().email('Invalid email address'),
  mailSentEngine: z.string().optional().default('SMTP'),
  smtpHost: z.string().optional(),
  smtpPort: z.union([z.number(), z.string()]).optional(),
});

export const testLdapSchema = z.object({
  serverUrl: z.string().min(1, 'Server URL / Host is required'),
  port: z.union([z.number(), z.string()]).optional().default(389),
  bindDn: z.string().optional(),
  baseDn: z.string().optional(),
});
