import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : new Date().getFullYear();

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      contributions,
      welfareCases,
      registrations,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { memberStatus: 'ACTIVE' } }),
      prisma.member.count({ where: { memberStatus: 'INACTIVE' } }),
      prisma.contribution.groupBy({
        by: ['month', 'year'],
        where: {
          status: 'VERIFIED',
          year,
        },
        _sum: { amount: true },
        _count: true,
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      }),
      prisma.welfareCase.findMany({
        where: {
          createdAt: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
      }),
      prisma.member.findMany({
        where: {
          registrationDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
        select: {
          registrationDate: true,
        },
      }),
    ]);

    const totalContributions = contributions.reduce(
      (sum, c) => sum + Number(c._sum.amount || 0),
      0
    );

    const registrationsByMonth = Array.from({ length: 12 }, (_, month) => {
      return registrations.filter((r) => r.registrationDate.getMonth() === month).length;
    });

    const membersByMinistry = await prisma.member.groupBy({
      by: ['ministry'],
      where: { memberStatus: 'ACTIVE' },
      _count: true,
      orderBy: { _count: { ministry: 'desc' } },
    });

    const membersByEmploymentStatus = await prisma.member.groupBy({
      by: ['employmentStatus'],
      _count: true,
    });

    const welfareCasesByStatus = welfareCases.reduce((acc: any, wc) => {
      acc[wc.status] = (acc[wc.status] || 0) + 1;
      return acc;
    }, {});

    const welfareCasesByType = welfareCases.reduce((acc: any, wc) => {
      if (!acc[wc.type]) {
        acc[wc.type] = {
          count: 0,
          amountRequested: 0,
          amountApproved: 0,
        };
      }
      acc[wc.type].count += 1;
      acc[wc.type].amountRequested += Number(wc.amountRequested);
      acc[wc.type].amountApproved += Number(wc.amountApproved);
      return acc;
    }, {});

    return NextResponse.json({
      year,
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: inactiveMembers,
        byMinistry: membersByMinistry,
        byEmploymentStatus: membersByEmploymentStatus,
      },
      contributions: {
        total: totalContributions,
        byMonth: contributions,
        averagePerMember: activeMembers > 0 ? totalContributions / activeMembers : 0,
      },
      registrations: {
        byMonth: registrationsByMonth,
      },
      welfareCases: {
        byStatus: welfareCasesByStatus,
        byType: welfareCasesByType,
      },
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}
