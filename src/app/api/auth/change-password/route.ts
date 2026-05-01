import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword, isPasswordStrong } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFirstTime = searchParams.get('first') === 'true';

    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isFirstTime && !currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!isFirstTime) {
      const isValidPassword = await verifyPassword(currentPassword, user.password);

      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
