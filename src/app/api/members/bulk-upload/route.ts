import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { members } = await request.json();

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'Invalid members data' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < members.length; i++) {
      const memberData = members[i];

      try {
        const member = await prisma.member.create({
          data: {
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            surname: memberData.surname || null,
            idNumber: memberData.idNumber,
            dateOfBirth: memberData.dateOfBirth
              ? new Date(memberData.dateOfBirth)
              : new Date('1990-01-01'),
            ministry: memberData.ministry,
            stateDepartment: memberData.stateDepartment,
            payrollNumber: memberData.payrollNumber,
            phoneNumber: memberData.phoneNumber,
            alternativePhone: memberData.alternativePhone || null,
            email: memberData.email,
            postalAddress: memberData.postalAddress || null,
            hasAgreedToTerms: memberData.agreedToTerms || false,
            employmentStatus: memberData.employmentStatus || 'IN_SERVICE',
            memberStatus: 'INACTIVE',
          },
        });

        results.push({
          row: i + 1,
          status: 'success',
          member,
        });
      } catch (error: any) {
        errors.push({
          row: i + 1,
          status: 'error',
          error: error.message || 'Failed to create member',
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk upload completed',
      total: members.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json({ error: 'Failed to process bulk upload' }, { status: 500 });
  }
}
