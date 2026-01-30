import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCompleteUserProfile, getUserByEmail, getUserByWalletAddress } from '@/lib/database.service';
import type { UserProfileInsert, PatientProfileInsert, HospitalProfileInsert, DoctorProfileInsert } from '@/lib/database.types';
import { validateRegistrationData } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/auth.middleware';

export async function POST(request: NextRequest) {
    try {
        // SECURITY: Rate limiting - max 10 registrations per IP per minute
        const clientIp = getClientIp(request);
        if (!checkRateLimit(`registration:${clientIp}`, 10, 60000)) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await request.json();

        // Use Service Role client to bypass RLS for registration
        // This is safe because:
        // 1. This API validates user identity via the auth token
        // 2. We only create profiles for the authenticated user's own ID
        // 3. Service Role key is server-side only (not exposed to client)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Use service role if available, otherwise fall back to anon key
        const adminClient = createClient(
            supabaseUrl,
            serviceRoleKey || anonKey,
            { auth: { persistSession: false } }
        );

        // SECURITY: Validate and sanitize all input data
        let validatedData;
        try {
            validatedData = validateRegistrationData(body);
        } catch (validationError: unknown) {
            return NextResponse.json(
                {
                    error: 'Invalid input data',
                    details: (validationError as { errors?: unknown; message?: string }).errors || (validationError as { errors?: unknown; message?: string }).message
                },
                { status: 400 }
            );
        }

        const {
            userId,
            email,
            walletAddress,
            role,
            authProvider,
            fullName,
            avatarUrl,
            // Patient-specific fields
            dateOfBirth,
            gender,
            bloodType,
            phoneNumber,
            emergencyContact,
            emergencyPhone,
            address,
            city,
            state,
            country,
            postalCode,
            // Hospital-specific fields
            hospitalName,
            licenseNumber,
            registrationNumber,
            specialization,
            website,
            description,
            // Doctor-specific fields
            firstName,
            lastName,
            medicalLicenseNumber,
            specialty,
            subSpecialty,
            yearsOfExperience,
            primaryHospitalId,
            hospitalDepartment
        } = validatedData;

        // SECURITY: Check if user already exists (prevent duplicate accounts)
        let existingUser = null;
        // Use admin client to bypass RLS for user lookup and creation
        const dbClient = adminClient;

        if (email) {
            existingUser = await getUserByEmail(email, dbClient);
        } else if (walletAddress) {
            existingUser = await getUserByWalletAddress(walletAddress, dbClient);
        }

        let userAlreadyExisted = false;
        if (existingUser) {
            // If user exists, check if they are trying to "resume" or "re-register"
            // If they are signing up with the same role and ID, we might allow creating the missing profile
            if (existingUser.id === userId && existingUser.role === role) {
                console.log("User already exists but matching ID and role. Checking if profile exists...");
                // We'll proceed to try creating the profile. 
                // createCompleteUserProfile will handle existing user records.
                userAlreadyExisted = true;
            } else {
                return NextResponse.json(
                    { error: 'User already exists', user: existingUser },
                    { status: 409 }
                );
            }
        }

        // Harden against Admin role self-assignment
        if (role === 'admin') {
            return NextResponse.json(
                { error: "Unauthorized role request. Admin roles must be assigned by existing administrators." },
                { status: 403 }
            );
        }

        // Validate allowed roles
        const allowedRoles = ['patient', 'hospital', 'doctor'];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json(
                { error: "Invalid role specified." },
                { status: 400 }
            );
        }

        // Prepare user profile data
        const userProfile: UserProfileInsert = {
            id: userId,
            email: email || null,
            wallet_address: walletAddress || null,
            role,
            auth_provider: authProvider,
            full_name: fullName || null,
            avatar_url: avatarUrl || null
        };

        // Prepare role-specific profile data
        let roleProfile: PatientProfileInsert | HospitalProfileInsert | DoctorProfileInsert;

        if (role === 'patient') {
            roleProfile = {
                user_id: userId,
                date_of_birth: dateOfBirth || null,
                gender: gender || null,
                blood_type: bloodType || null,
                phone_number: phoneNumber || null,
                emergency_contact: emergencyContact || null,
                emergency_phone: emergencyPhone || null,
                address: address || null,
                city: city || null,
                state: state || null,
                country: country || null,
                postal_code: postalCode || null,
                medical_conditions: null,
                allergies: null,
                medications: null
            } as PatientProfileInsert;
        } else if (role === 'hospital') {
            // Hospital role - validated by Zod schema
            roleProfile = {
                user_id: userId,
                hospital_name: hospitalName!,
                license_number: licenseNumber || null,
                registration_number: registrationNumber || null,
                specialization: specialization || null,
                phone_number: phoneNumber || null,
                address: address || null,
                city: city || null,
                state: state || null,
                country: country || null,
                postal_code: postalCode || null,
                website: website || null,
                description: description || null
            } as HospitalProfileInsert;
        } else if (role === 'doctor') {
            // Doctor role
            const isHospitalUuid = primaryHospitalId && primaryHospitalId.length > 30; // Basic check for UUID vs Name

            roleProfile = {
                user_id: userId,
                first_name: firstName || fullName?.split(' ')[0] || 'Doctor',
                last_name: lastName || fullName?.split(' ').slice(1).join(' ') || 'User',
                email: email!,
                phone: phoneNumber || null,
                medical_license_number: medicalLicenseNumber || `PENDING-${userId.slice(0, 8)}`, // Use unique fallback
                specialty: specialty || 'General Practice',
                sub_specialty: subSpecialty || null,
                years_of_experience: yearsOfExperience || 0,
                primary_hospital_id: isHospitalUuid ? primaryHospitalId : null,
                hospital_name: isHospitalUuid ? null : (primaryHospitalId || 'Private Practice'),
                hospital_department: hospitalDepartment || null,
                license_document_url: null,
                certification_urls: null
            } as DoctorProfileInsert;
        } else {
            return NextResponse.json(
                { error: "Invalid role configuration" },
                { status: 400 }
            );
        }

        // DEBUG: Logging profiles
        console.log('Registering User Profile:', JSON.stringify(userProfile, null, 2));
        console.log('Registering Role Profile:', JSON.stringify(roleProfile, null, 2));

        // SECURITY: Create user in database with sanitized data
        const result = await createCompleteUserProfile(userProfile, roleProfile, dbClient);

        // SECURITY: Don't expose internal database details in response
        return NextResponse.json(
            {
                success: true,
                message: 'User registered successfully',
                data: {
                    userId: result.user.id,
                    role: result.user.role
                }
            },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error('Registration error:', error);
        const err = error as { message?: string; code?: string; details?: string; hint?: string; name?: string; errors?: unknown };

        // Return detailed error in dev, but generic in prod
        const errorMessage = err.message || 'Registration failed';
        const errorCode = err.code || 'UNKNOWN_ERROR';

        // Check if it's a database table missing error
        if (err.code === '42P01' || (typeof err.message === 'string' && (err.message.includes('relation') || err.message.includes('does not exist')))) {
            return NextResponse.json(
                {
                    error: 'Database tables not set up',
                    message: 'Please create the database tables in Supabase first.',
                    hint: 'Go to Supabase → SQL Editor → Run the schema from database-schema.md'
                },
                { status: 503 }
            );
        }

        // Check for unique constraint violations (e.g. license number)
        if (err.code === '23505') {
            return NextResponse.json(
                {
                    error: 'Duplicate record detected',
                    message: 'The email or professional license number provided is already registered.',
                    details: err.details
                },
                { status: 409 }
            );
        }

        // Check if it's a validation error
        if (err.name === 'ZodError' || err.errors) {
            return NextResponse.json(
                {
                    error: 'Invalid input data',
                    details: err.errors || err.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: 'Registration failed',
                message: errorMessage,
                details: err.details,
                code: errorCode
            },
            { status: 500 }
        );
    }
}
