import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      suspendedMembers,
      todayRegistrations,
      yesterdayRegistrations,
      thisMonthRegistrations,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { memberStatus: 'ACTIVE' } }),
      prisma.member.count({ where: { memberStatus: 'INACTIVE' } }),
      prisma.member.count({ where: { memberStatus: 'SUSPENDED' } }),
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
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Fetch data for Status Pie Chart
    const statusData = [
      { name: 'Active', value: activeMembers, color: '#22c55e' },
      { name: 'Pending', value: inactiveMembers, color: '#f59e0b' },
      { name: 'Suspended', value: suspendedMembers, color: '#ef4444' },
    ];

    // Fetch data for Ministry Bar Chart
    const ministries = await prisma.member.groupBy({
      by: ['ministry'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const ministryData = ministries.map((m) => ({
      name: m.ministry,
      count: m._count.id,
      short: m.ministry.length > 10 ? m.ministry.substring(0, 10) + '...' : m.ministry,
    }));

    // Fetch data for Registration Trend (last 8 weeks)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const [registrations, verified] = await Promise.all([
        prisma.member.count({
          where: {
            registrationDate: {
              gte: start,
              lt: end,
            },
          },
        }),
        prisma.member.count({
          where: {
            memberStatus: 'ACTIVE',
            approvalDate: {
              gte: start,
              lt: end,
            },
          },
        }),
      ]);

      const weekLabel = `Week ${8 - i}`;
      weeklyData.push({
        week: weekLabel,
        registrations,
        verified,
      });
    }

    const stats = {
      totalMembers,
      activeMembers,
      pendingVerifications: inactiveMembers,
      todayRegistrations,
      yesterdayRegistrations,
      thisMonthRegistrations,
      totalContributions,
      verifiedContributions,
      thisWeekContributions,
      paymentConfirmed: verifiedContributions,
      rejected: suspendedMembers,
      statusData,
      ministryData,
      weeklyData,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
