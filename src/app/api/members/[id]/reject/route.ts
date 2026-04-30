import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyMemberRejected } from '@/lib/notification-helpers';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { rejectedBy, reason } = body;

    const member = await prisma.member.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.memberStatus === 'REJECTED') {
      return NextResponse.json({ error: 'Member is already rejected' }, { status: 400 });
    }

    if (member.memberStatus === 'ACTIVE') {
      return NextResponse.json({ error: 'Cannot reject an active member' }, { status: 400 });
    }

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: {
        memberStatus: 'REJECTED',
        rejectionDate: new Date(),
        rejectedBy,
        rejectionReason: reason,
      },
    });

    // Trigger rejection notification and email
    try {
      await notifyMemberRejected(member.id, reason);
    } catch (notifyError) {
      console.error('Error triggering rejection notification:', notifyError);
    }

    return NextResponse.json({
      member: updatedMember,
      message: 'Member rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting member:', error);
    return NextResponse.json({ error: 'Failed to reject member' }, { status: 500 });
  }
}