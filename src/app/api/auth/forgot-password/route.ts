import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePasswordResetToken, generatePasswordResetExpiry } from '@/lib/auth';
import { createUserNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: true,
      },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json({
        message: 'If your email address is in our database, you will receive a password reset link shortly.',
      });
    }

    // Generate reset token and expiry
    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = generatePasswordResetExpiry();

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset password link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const resetLink = `${cleanBaseUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      // Only create notification if user has an associated member
      if (user.member?.id) {
        await createUserNotification({
          memberId: user.member.id,
          type: 'INFO',
          title: 'Password Reset Request',
          message: `You have requested to reset your password. Please click the link below to set a new password. This link will expire in 1 hour.`,
          link: resetLink,
          icon: '🔐',
        });
      }

      // Send direct email for password reset
      const { sendEmailAsync } = await import('@/lib/email');
      await sendEmailAsync({
        to: user.email,
        subject: 'HHS Welfare: Password Reset Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1d4ed8;">Password Reset Request</h2>
            <p>Hello ${user.member?.firstName || 'User'},</p>
            <p>You have requested to reset your password. Please click the link below to set a new password:</p>
            <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated notification from HHS Welfare System.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Continue with the response even if email fails
    }

    return NextResponse.json({
      message: 'If your email address is in our database, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}