import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (status) {
      where.status = status;
    }

    if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { year: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              payrollNumber: true,
              ministry: true,
            },
          },
        },
      }),
      prisma.contribution.count({ where }),
    ]);

    return NextResponse.json({
      contributions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contribution = await prisma.contribution.create({
      data: {
        memberId: body.memberId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        mpesaConfirmation: body.mpesaConfirmation,
        reference: body.reference,
        month: body.month,
        year: body.year,
        status: 'PENDING',
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
  }
}
