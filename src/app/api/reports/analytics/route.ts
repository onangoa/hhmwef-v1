import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : new Date().getFullYear();
    const memberId = searchParams.get('memberId');
    const contributionStatus = searchParams.get('contributionStatus');
    const welfareStatus = searchParams.get('welfareStatus');
    const welfareType = searchParams.get('welfareType');

    // Build filters
    const contributionWhere: any = { year };
    if (memberId && memberId !== 'all') contributionWhere.memberId = memberId;
    if (contributionStatus && contributionStatus !== 'all') contributionWhere.status = contributionStatus;

    const welfareWhere: any = {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    };
    if (memberId && memberId !== 'all') welfareWhere.memberId = memberId;
    if (welfareStatus && welfareStatus !== 'all') welfareWhere.status = welfareStatus;
    if (welfareType && welfareType !== 'all') welfareWhere.type = welfareType;

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      contributions,
      welfareCases,
      registrations,
      detailedContributions,
      detailedWelfareCases,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { memberStatus: 'ACTIVE' } }),
      prisma.member.count({ where: { memberStatus: 'INACTIVE' } }),
      prisma.contribution.groupBy({
        by: ['month', 'year'],
        where: contributionWhere,
        _sum: { amount: true },
        _count: true,
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      }),
      prisma.welfareCase.findMany({
        where: welfareWhere,
      }),
      prisma.member.findMany({
        where: {
          registrationDate: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
        select: {
          registrationDate: true,
        },
      }),
      prisma.contribution.findMany({
        where: contributionWhere,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.welfareCase.findMany({
        where: welfareWhere,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
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
      filters: {
        memberId,
        contributionStatus,
        welfareStatus,
        welfareType,
      },
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
        details: detailedContributions,
      },
      registrations: {
        byMonth: registrationsByMonth,
      },
      welfareCases: {
        byStatus: welfareCasesByStatus,
        byType: welfareCasesByType,
        details: detailedWelfareCases,
      },
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}
