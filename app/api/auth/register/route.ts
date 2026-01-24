import { NextRequest, NextResponse } from 'next/server';
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
        if (email) {
            existingUser = await getUserByEmail(email);
        } else if (walletAddress) {
            existingUser = await getUserByWalletAddress(walletAddress);
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists', user: existingUser },
                { status: 409 }
            );
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
            roleProfile = {
                user_id: userId,
                first_name: firstName || fullName?.split(' ')[0] || 'Doctor',
                last_name: lastName || fullName?.split(' ').slice(1).join(' ') || 'User',
                email: email!,
                phone: phoneNumber || null,
                medical_license_number: medicalLicenseNumber || 'PENDING',
                specialty: specialty || 'General Practice',
                sub_specialty: subSpecialty || null,
                years_of_experience: yearsOfExperience || 0,
                primary_hospital_id: null, // This requires a UUID, form gives a name
                hospital_name: primaryHospitalId || 'Private Practice',
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

        // SECURITY: Create user in database with sanitized data
        const result = await createCompleteUserProfile(userProfile, roleProfile);

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
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            details: err.details,
            hint: err.hint
        });

        // Check if it's a database table missing error
        if (err.code === '42P01' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
            return NextResponse.json(
                {
                    error: 'Database tables not set up',
                    message: 'Please create the database tables in Supabase first. See database-schema.md for instructions.',
                    hint: 'Go to Supabase → SQL Editor → Run the schema from database-schema.md'
                },
                { status: 503 }
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

        // SECURITY: Don't expose internal error details to client in production
        return NextResponse.json(
            {
                error: 'Registration failed',
                message: process.env.NODE_ENV === 'development'
                    ? err.message
                    : 'An error occurred during registration. Please try again.',
                // Provide helpful hints
                hint: 'Check browser console for details or contact support'
            },
            { status: 500 }
        );
    }
}
