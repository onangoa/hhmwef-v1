import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active members (not users with committee roles)
    const activeMembers = await prisma.member.findMany({
      where: {
        memberStatus: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    console.log('Active members found:', activeMembers.map(m => ({ 
      memberId: m.id, 
      name: `${m.firstName} ${m.lastName}`,
      email: m.user?.email,
      role: m.user?.role 
    })));

    return NextResponse.json(activeMembers);
  } catch (error) {
    console.error('Error fetching active members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active members' },
      { status: 500 }
    );
  }
}