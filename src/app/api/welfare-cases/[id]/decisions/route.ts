import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { memberId, role, decision, comment } = body;

    const welfareCase = await prisma.welfareCase.findUnique({
      where: { id: params.id },
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
        caseId: params.id,
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
      where: { caseId: params.id },
    });

    if (allDecisions.length >= 3) {
      const approvedCount = allDecisions.filter((d) => d.decision === 'APPROVED').length;
      const rejectedCount = allDecisions.filter((d) => d.decision === 'REJECTED').length;

      let newStatus = welfareCase.status;

      if (approvedCount >= 3) {
        newStatus = 'APPROVED';
      } else if (rejectedCount >= 2) {
        newStatus = 'REJECTED';
      } else if (approvedCount >= 2 && rejectedCount === 0) {
        newStatus = 'UNDER_REVIEW';
      }

      if (newStatus !== welfareCase.status) {
        await prisma.welfareCase.update({
          where: { id: params.id },
          data: { status: newStatus },
        });
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
