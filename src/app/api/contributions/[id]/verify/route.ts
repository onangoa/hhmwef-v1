import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyContributionVerified } from '@/lib/notification-helpers';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { verifiedBy, arrears, penalty } = body;

    const contribution = await prisma.contribution.update({
      where: { id: params.id },
      data: {
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
        arrears: arrears || 0,
        penalty: penalty || 0,
      },
      include: {
        member: true,
      },
    });

    // Create notification for the member
    await notifyContributionVerified(contribution.memberId);

    return NextResponse.json({
      contribution,
      message: 'Contribution verified successfully',
    });
  } catch (error) {
    console.error('Error verifying contribution:', error);
    return NextResponse.json({ error: 'Failed to verify contribution' }, { status: 500 });
  }
}
