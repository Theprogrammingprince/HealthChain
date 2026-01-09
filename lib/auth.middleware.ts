import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for server-side auth verification
function getSupabaseClient(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
}

/**
 * Verify that the request has a valid Supabase session
 * Returns the authenticated user or throws an error
 */
export async function verifyAuth(req: NextRequest) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient(req);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new Error('Invalid or expired session token');
    }

    return user;
}

/**
 * Verify that the authenticated user matches the requested user ID
 * Prevents users from accessing other users' data
 */
export async function verifyUserOwnership(req: NextRequest, requestedUserId: string) {
    const user = await verifyAuth(req);

    if (user.id !== requestedUserId) {
        throw new Error('Unauthorized: Cannot access other users\' data');
    }

    return user;
}

/**
 * Check if user has specific role
 */
export async function verifyRole(req: NextRequest, allowedRoles: string[]) {
    const user = await verifyAuth(req);
    const userRole = user.user_metadata?.role || 'patient';

    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Unauthorized: Required role is one of [${allowedRoles.join(', ')}]`);
    }

    return user;
}

/**
 * Rate limiting helper - tracks requests per IP
 */
const requestTracker = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): boolean {
    const now = Date.now();
    const record = requestTracker.get(identifier);

    if (!record || now > record.resetTime) {
        // New window
        requestTracker.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxRequests) {
        return false; // Rate limit exceeded
    }

    record.count++;
    return true;
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] :
        req.headers.get('x-real-ip') ||
        'unknown';
    return ip;
}
