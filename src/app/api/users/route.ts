import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where: any = {};

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
