import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyWelfareCaseApproved } from '@/lib/notification-helpers';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, role, decision, comment } = body;

    // Validate the decision value
    const validDecisions = ['APPROVED', 'REJECTED', 'DEFERRED'];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ 
        error: `Invalid decision value: ${decision}. Must be one of: ${validDecisions.join(', ')}` 
      }, { status: 400 });
    }

    // Validate that the member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      console.log('Member validation failed - memberId received:', memberId);
      console.log('Member validation failed - memberId type:', typeof memberId);
      return NextResponse.json({ 
        error: `Member with ID '${memberId}' not found in database` 
      }, { status: 404 });
    }

    console.log('Member validation passed - found member:', { id: member.id, name: `${member.firstName} ${member.lastName}` });

    const welfareCase = await prisma.welfareCase.findUnique({
      where: { id },
      include: {
        committeeDecisions: true,
      },
    });

    if (!welfareCase) {
      return NextResponse.json({ error: 'Welfare case not found' }, { status: 404 });
    }

    const existingDecision = welfareCase.committeeDecisions.find((d) => d.memberId === memberId);

    if (existingDecision) {
      return NextResponse.json(
        { error: 'Member has already made a decision on this case' },
        { status: 400 }
      );
    }

    const committeeDecision = await prisma.committeeDecision.create({
      data: {
        caseId: id,
        memberId,
        role,
        decision,
        comment,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        case: true,
      },
    });

    const allDecisions = await prisma.committeeDecision.findMany({
      where: { caseId: id },
    });

    const approvedCount = allDecisions.filter((d) => d.decision === 'APPROVED').length;
    const rejectedCount = allDecisions.filter((d) => d.decision === 'REJECTED').length;

    let newStatus = welfareCase.status;

    if (approvedCount >= 3) {
      newStatus = 'APPROVED';
    } else if (rejectedCount >= 2) {
      newStatus = 'REJECTED';
    } else if (approvedCount >= 1 && welfareCase.status === 'PENDING') {
      newStatus = 'UNDER_REVIEW';
    }

    if (newStatus !== welfareCase.status) {
      await prisma.welfareCase.update({
        where: { id },
        data: { status: newStatus },
      });

      if (newStatus === 'APPROVED') {
        await notifyWelfareCaseApproved(welfareCase.memberId);
      }
    }

    return NextResponse.json({
      decision: committeeDecision,
      message: 'Committee decision recorded successfully',
    });
  } catch (error) {
    console.error('Error recording committee decision:', error);
    return NextResponse.json({ error: 'Failed to record committee decision' }, { status: 500 });
  }
}
