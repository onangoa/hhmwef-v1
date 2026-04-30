import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [cases, total] = await Promise.all([
      prisma.welfareCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              payrollNumber: true,
              ministry: true,
            },
          },
          committeeDecisions: {
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          disbursements: true,
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
      }),
      prisma.welfareCase.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching welfare cases:', error);
    return NextResponse.json({ error: 'Failed to fetch welfare cases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const currentYear = new Date().getFullYear();
    const caseCount = await prisma.welfareCase.count({
      where: {
        caseNumber: {
          contains: `WC/${currentYear}`,
        },
      },
    });

    const caseNumber = `WC/${currentYear}/${String(caseCount + 1).padStart(3, '0')}`;

    const welfareCase = await prisma.welfareCase.create({
      data: {
        caseNumber,
        memberId: body.memberId,
        type: body.type,
        status: 'PENDING',
        title: body.title,
        description: body.description,
        amountRequested: Number(body.amountRequested),
        supportingDocs: body.supportingDocs || [],
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json({ success: true, case: welfareCase }, { status: 200 });
  } catch (error) {
    console.error('Error creating welfare case:', error);
    return NextResponse.json({ error: 'Failed to create welfare case' }, { status: 500 });
  }
}
