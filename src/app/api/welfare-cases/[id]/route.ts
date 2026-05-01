import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params;

    const welfareCase = await prisma.welfareCase.findUnique({
      where: { id },
      include: {
        member: true,
        committeeDecisions: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                groupRole: true,
              },
            },
          },
          orderBy: { decidedAt: 'desc' },
        },
        disbursements: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        contributions: {
          include: {
            contribution: {
              include: {
                member: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!welfareCase) {
      return NextResponse.json({ error: 'Welfare case not found' }, { status: 404 });
    }

    return NextResponse.json(welfareCase);
  } catch (error) {
    console.error('Error fetching welfare case:', error);
    return NextResponse.json({ error: 'Failed to fetch welfare case' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    
    // Await the params to get the id
    const { id } = await params;

    // Check if welfare case exists and is still pending
    const existingCase = await prisma.welfareCase.findUnique({
      where: { id },
    });

    if (!existingCase) {
      return NextResponse.json({ error: 'Welfare case not found' }, { status: 404 });
    }

    if (existingCase.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Only pending welfare cases can be edited' 
      }, { status: 400 });
    }

    const welfareCase = await prisma.welfareCase.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        description: body.description,
        amountRequested: body.amountRequested,
      },
      include: {
        member: true,
        committeeDecisions: true,
        disbursements: true,
      },
    });

    return NextResponse.json(welfareCase);
  } catch (error) {
    console.error('Error updating welfare case:', error);
    return NextResponse.json({ error: 'Failed to update welfare case' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    
    // Await the params to get the id
    const { id } = await params;

    const welfareCase = await prisma.welfareCase.update({
      where: { id },
      data: {
        status: body.status,
        amountApproved: body.amountApproved,
        description: body.description,
        supportingDocs: body.supportingDocs,
      },
      include: {
        member: true,
        committeeDecisions: true,
        disbursements: true,
      },
    });

    return NextResponse.json(welfareCase);
  } catch (error) {
    console.error('Error updating welfare case:', error);
    return NextResponse.json({ error: 'Failed to update welfare case' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params;

    await prisma.welfareCase.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Welfare case deleted successfully' });
  } catch (error) {
    console.error('Error deleting welfare case:', error);
    return NextResponse.json({ error: 'Failed to delete welfare case' }, { status: 500 });
  }
}
