import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateDefaultPassword } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { approvedBy, role } = body;

    const member = await prisma.member.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.memberStatus === 'ACTIVE') {
      return NextResponse.json({ error: 'Member is already active' }, { status: 400 });
    }

    const defaultPassword = generateDefaultPassword();
    const hashedPassword = await hashPassword(defaultPassword);

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: {
        memberStatus: 'ACTIVE',
        approvalDate: new Date(),
        approvedBy,
        user: {
          create: {
            email: member.email,
            password: hashedPassword,
            role: role || 'MEMBER',
            mustChangePassword: true,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      member: updatedMember,
      message: 'Member approved successfully',
      defaultPassword,
    });
  } catch (error) {
    console.error('Error approving member:', error);
    return NextResponse.json({ error: 'Failed to approve member' }, { status: 500 });
  }
}
