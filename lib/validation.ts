import { z } from 'zod';

// Zod schemas for validation

/**
 * Email validation
 */
export const emailSchema = z.string().email().max(255);

/**
 * Wallet address validation (Ethereum format)
 */
export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid();

/**
 * Role validation
 */
export const roleSchema = z.enum(['patient', 'hospital']);

/**
 * Auth provider validation
 */
export const authProviderSchema = z.enum(['google', 'wallet']);

/**
 * User profile validation
 */
export const userProfileSchema = z.object({
    userId: z.string().min(1).max(255),
    email: emailSchema.optional().nullable(),
    walletAddress: walletAddressSchema.optional().nullable(),
    role: roleSchema,
    authProvider: authProviderSchema,
    fullName: z.string().max(255).optional().nullable(),
    avatarUrl: z.string().url().max(500).optional().nullable()
}).refine(
    data => data.email || data.walletAddress,
    { message: 'Either email or walletAddress must be provided' }
);

/**
 * Patient profile validation
 */
export const patientProfileSchema = z.object({
    dateOfBirth: z.string().date().optional().nullable(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().nullable(),
    phoneNumber: z.string().max(20).optional().nullable(),
    emergencyContact: z.string().max(255).optional().nullable(),
    emergencyPhone: z.string().max(20).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable()
});

/**
 * Hospital profile validation
 */
export const hospitalProfileSchema = z.object({
    hospitalName: z.string().min(1).max(255),
    licenseNumber: z.string().max(100).optional().nullable(),
    registrationNumber: z.string().max(100).optional().nullable(),
    specialization: z.array(z.string().max(100)).max(20).optional().nullable(),
    phoneNumber: z.string().max(20).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable(),
    website: z.string().url().max(255).optional().nullable(),
    description: z.string().max(1000).optional().nullable()
});

/**
 * Complete registration validation
 */
export const registrationSchema = userProfileSchema.merge(
    z.object({
        patient: patientProfileSchema.optional(),
        hospital: hospitalProfileSchema.optional()
    })
).refine(
    data => {
        if (data.role === 'hospital') {
            return data.hospital && data.hospital.hospitalName;
        }
        return true;
    },
    { message: 'Hospital name is required for hospital role' }
);

/**
 * Sanitize string input - remove dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string | null {
    if (!input) return null;

    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove any SQL keywords (basic protection)
    const sqlKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', 'UNION', 'EXEC', '--', ';'];
    sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) : item
            );
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Validate and sanitize registration data
 */
export function validateRegistrationData(data: any) {
    // First validate structure
    const validated = registrationSchema.parse(data);

    // Then sanitize strings
    return sanitizeObject(validated);
}

/**
 * Validate user ID format
 */
export function validateUserId(userId: string): boolean {
    // Check if it's a UUID or Ethereum address
    try {
        uuidSchema.parse(userId);
        return true;
    } catch {
        try {
            walletAddressSchema.parse(userId);
            return true;
        } catch {
            return false;
        }
    }
}
