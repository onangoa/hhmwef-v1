import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { memberId, amount, method, reference } = body;
    
    // Await the params to get the id
    const { id } = await params;

    const welfareCase = await prisma.welfareCase.findUnique({
      where: { id },
    });

    if (!welfareCase) {
      return NextResponse.json({ error: 'Welfare case not found' }, { status: 404 });
    }

    if (welfareCase.status !== 'APPROVED' && welfareCase.status !== 'DISBURSED') {
      return NextResponse.json(
        { error: 'Welfare case must be approved before disbursement' },
        { status: 400 }
      );
    }

    const disbursement = await prisma.disbursement.create({
      data: {
        caseId: id,
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
      where: { id },
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
