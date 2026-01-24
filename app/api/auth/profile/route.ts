import { NextRequest, NextResponse } from 'next/server';
import { getCompleteUserProfile } from '@/lib/database.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userProfile = await getCompleteUserProfile(userId);

        if (!userProfile) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: userProfile
        });

    } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch user profile',
                details: (error as { message?: string }).message
            },
            { status: 500 }
        );
    }
}
