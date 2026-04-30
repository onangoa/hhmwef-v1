import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { memberId, amount, method, reference } = body;

    const welfareCase = await prisma.welfareCase.findUnique({
      where: { id: params.id },
    });

    if (!welfareCase) {
      return NextResponse.json({ error: 'Welfare case not found' }, { status: 404 });
    }

    if (welfareCase.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Welfare case must be approved before disbursement' },
        { status: 400 }
      );
    }

    const disbursement = await prisma.disbursement.create({
      data: {
        caseId: params.id,
        memberId,
        amount,
        method,
        reference,
        disbursedBy: memberId,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.welfareCase.update({
      where: { id: params.id },
      data: { status: 'DISBURSED' },
    });

    return NextResponse.json({
      disbursement,
      message: 'Disbursement recorded successfully',
    });
  } catch (error) {
    console.error('Error recording disbursement:', error);
    return NextResponse.json({ error: 'Failed to record disbursement' }, { status: 500 });
  }
}
