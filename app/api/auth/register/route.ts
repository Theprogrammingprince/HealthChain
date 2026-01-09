import { NextRequest, NextResponse } from 'next/server';
import { createCompleteUserProfile, getUserByEmail, getUserByWalletAddress } from '@/lib/database.service';
import type { UserProfileInsert, PatientProfileInsert, HospitalProfileInsert } from '@/lib/database.types';
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
        } catch (validationError: any) {
            return NextResponse.json(
                {
                    error: 'Invalid input data',
                    details: validationError.errors || validationError.message
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
            description
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
        let roleProfile: PatientProfileInsert | HospitalProfileInsert;

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
        } else {
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

    } catch (error: any) {
        console.error('Registration error:', error);

        // SECURITY: Don't expose internal error details to client
        return NextResponse.json(
            {
                error: 'Registration failed. Please try again.',
                // Only include detailed error in development
                ...(process.env.NODE_ENV === 'development' && {
                    details: error.message
                })
            },
            { status: 500 }
        );
    }
}
