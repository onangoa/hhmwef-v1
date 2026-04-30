import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalMembers,
      activeMembers,
      pendingVerifications,
      todayRegistrations,
      yesterdayRegistrations,
      thisMonthRegistrations,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { memberStatus: 'ACTIVE' } }),
      prisma.member.count({ where: { memberStatus: 'INACTIVE' } }),
      prisma.member.count({
        where: {
          registrationDate: {
            gte: todayStart,
          },
        },
      }),
      prisma.member.count({
        where: {
          registrationDate: {
            gte: yesterdayStart,
            lt: todayStart,
          },
        },
      }),
      prisma.member.count({
        where: {
          registrationDate: {
            gte: thisMonthStart,
          },
        },
      }),
    ]);

    const [totalContributions, verifiedContributions, thisWeekContributions] = await Promise.all([
      prisma.contribution.count(),
      prisma.contribution.count({ where: { status: 'VERIFIED' } }),
      prisma.contribution.count({
        where: {
          status: 'VERIFIED',
          verifiedAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 1000),
          },
        },
      }),
    ]);

    const rejectedMembers = await prisma.member.count({
      where: { memberStatus: 'SUSPENDED' },
    });

    const stats = {
      totalMembers,
      activeMembers,
      pendingVerifications,
      todayRegistrations,
      yesterdayRegistrations,
      thisMonthRegistrations,
      totalContributions,
      verifiedContributions,
      thisWeekContributions,
      rejectedMembers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
