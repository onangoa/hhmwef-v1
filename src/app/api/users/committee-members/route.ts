import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch users with committee roles (ADMIN, TREASURER, SECRETARY)
    const committeeMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'TREASURER', 'SECRETARY']
        }
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    return NextResponse.json(committeeMembers);
  } catch (error) {
    console.error('Error fetching committee members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch committee members' },
      { status: 500 }
    );
  }
}