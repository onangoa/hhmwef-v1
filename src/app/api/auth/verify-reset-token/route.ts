import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isResetTokenValid } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 });
    }

    if (!user.resetTokenExpiry || !isResetTokenValid(user.resetTokenExpiry)) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}