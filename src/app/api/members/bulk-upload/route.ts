import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function formatPhoneNumber(phone: string): string {
  const cleanedPhone = phone.replace(/\s/g, '').replace(/-/g, '');

  if (cleanedPhone.startsWith('254')) {
    return cleanedPhone;
  } else if (cleanedPhone.startsWith('0')) {
    return '254' + cleanedPhone.slice(1);
  } else {
    return cleanedPhone;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { members } = await request.json();

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'Invalid members data' }, { status: 400 });
    }

    const results = [];
    const errors = [];
    const updatedCount = [];
    const createdCount = [];

    for (let i = 0; i < members.length; i++) {
      const memberData = members[i];

      try {
        const existingMember = await prisma.member.findFirst({
          where: {
            OR: [
              { email: memberData.email },
              { idNumber: memberData.idNumber },
              { payrollNumber: memberData.payrollNumber },
            ],
          },
        });

        let member;

        if (existingMember) {
          member = await prisma.member.update({
            where: { id: existingMember.id },
            data: {
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              surname: memberData.surname || null,
              dateOfBirth: memberData.dateOfBirth
                ? new Date(memberData.dateOfBirth)
                : existingMember.dateOfBirth,
              ministry: memberData.ministry,
              stateDepartment: memberData.stateDepartment,
              phoneNumber: memberData.phoneNumber ? formatPhoneNumber(memberData.phoneNumber) : null,
              alternativePhone: memberData.alternativePhone ? formatPhoneNumber(memberData.alternativePhone) : null,
              postalAddress: memberData.postalAddress || null,
              employmentStatus: memberData.employmentStatus || 'IN_SERVICE',
            },
          });
          updatedCount.push(i + 1);
        } else {
          member = await prisma.member.create({
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
              phoneNumber: memberData.phoneNumber ? formatPhoneNumber(memberData.phoneNumber) : null,
              alternativePhone: memberData.alternativePhone ? formatPhoneNumber(memberData.alternativePhone) : null,
              email: memberData.email,
              postalAddress: memberData.postalAddress || null,
              hasAgreedToTerms: memberData.agreedToTerms || false,
              employmentStatus: memberData.employmentStatus || 'IN_SERVICE',
              memberStatus: 'INACTIVE',
            },
          });
          createdCount.push(i + 1);
        }

        results.push({
          row: i + 1,
          status: existingMember ? 'updated' : 'created',
          member,
          action: existingMember ? 'Existing record updated' : 'New record created',
        });
      } catch (error: any) {
        errors.push({
          row: i + 1,
          status: 'error',
          error: error.message || 'Failed to process member',
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk upload completed',
      total: members.length,
      successful: results.length,
      failed: errors.length,
      updated: updatedCount.length,
      created: createdCount.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json({ error: 'Failed to process bulk upload' }, { status: 500 });
  }
}
