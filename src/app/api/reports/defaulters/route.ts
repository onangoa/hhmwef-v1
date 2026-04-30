import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month')
      ? parseInt(searchParams.get('month')!)
      : new Date().getMonth() + 1;
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : new Date().getFullYear();

    const allActiveMembers = await prisma.member.findMany({
      where: { memberStatus: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        payrollNumber: true,
        ministry: true,
        phoneNumber: true,
        email: true,
      },
    });

    const contributionsForMonth = await prisma.contribution.findMany({
      where: {
        month,
        year,
        status: 'VERIFIED',
      },
      select: {
        memberId: true,
        amount: true,
      },
    });

    const contributorsMap = new Map();
    contributionsForMonth.forEach((c) => {
      contributorsMap.set(c.memberId, c);
    });

    const defaulters = allActiveMembers
      .filter((m) => !contributorsMap.has(m.id))
      .map((m) => ({
        ...m,
        arrearsMonths: [],
      }));

    const contributions = await prisma.contribution.groupBy({
      by: ['memberId'],
      where: {
        OR: [{ arrears: { gt: 0 } }, { penalty: { gt: 0 } }],
      },
      _sum: {
        amount: true,
        arrears: true,
        penalty: true,
      },
    });

    const membersWithArrears = await prisma.member.findMany({
      where: {
        id: {
          in: contributions.map((c) => c.memberId),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        payrollNumber: true,
        ministry: true,
        phoneNumber: true,
        email: true,
      },
    });

    const arrearsList = membersWithArrears.map((m) => {
      const contribution = contributions.find((c) => c.memberId === m.id);
      return {
        ...m,
        totalArrears: Number(contribution?._sum.arrears || 0),
        totalPenalty: Number(contribution?._sum.penalty || 0),
        totalDue: Number(contribution?._sum.arrears || 0) + Number(contribution?._sum.penalty || 0),
      };
    });

    return NextResponse.json({
      month,
      year,
      summary: {
        totalActiveMembers: allActiveMembers.length,
        contributors: contributionsForMonth.length,
        defaulters: defaulters.length,
        withArrears: arrearsList.length,
      },
      defaulters,
      arrearsList,
    });
  } catch (error) {
    console.error('Error generating defaulters report:', error);
    return NextResponse.json({ error: 'Failed to generate defaulters report' }, { status: 500 });
  }
}
