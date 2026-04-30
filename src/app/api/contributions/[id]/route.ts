import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contribution = await prisma.contribution.findUnique({
      where: { id: params.id },
      include: {
        member: true,
        caseContributions: {
          include: {
            case: true,
          },
        },
      },
    });

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const contribution = await prisma.contribution.update({
      where: { id: params.id },
      data: {
        status: body.status,
        verifiedBy: body.verifiedBy,
        verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : undefined,
        arrears: body.arrears,
        penalty: body.penalty,
        receiptSent: body.receiptSent,
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.contribution.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 });
  }
}
