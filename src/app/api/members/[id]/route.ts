import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        spouse: true,
        nextOfKins: true,
        children: true,
        parentGuardians: true,
        parentsInLaws: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        surname: body.surname,
        idNumber: body.idNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        ministry: body.ministry,
        stateDepartment: body.stateDepartment,
        payrollNumber: body.payrollNumber,
        phoneNumber: body.phoneNumber,
        alternativePhone: body.alternativePhone,
        email: body.email,
        postalAddress: body.postalAddress,
        employmentStatus: body.employmentStatus,
        memberStatus: body.memberStatus,
        approvalDate: body.memberStatus === 'ACTIVE' ? new Date() : undefined,
        approvedBy: body.memberStatus === 'ACTIVE' ? 'ADMIN' : undefined,
        groupRole: body.groupRole,
        notificationEmailEnabled: body.notificationEmailEnabled,
        notificationSmsEnabled: body.notificationSmsEnabled,
        contributionAlerts: body.contributionAlerts,
        welfareAlerts: body.welfareAlerts,
        systemAlerts: body.systemAlerts,
        spouse:
          body.spouse &&
          (body.spouse.firstName ||
            body.spouse.lastName ||
            body.spouse.idNumber ||
            body.spouse.phoneNumber ||
            body.spouse.email ||
            body.spouse.address)
            ? {
                upsert: {
                  create: {
                    firstName: body.spouse.firstName,
                    lastName: body.spouse.lastName,
                    surname: body.spouse.surname || null,
                    address: body.spouse.address || null,
                    idNumber: body.spouse.idNumber,
                    phoneNumber: body.spouse.phoneNumber || null,
                    email: body.spouse.email || null,
                  },
                  update: {
                    firstName: body.spouse.firstName,
                    lastName: body.spouse.lastName,
                    surname: body.spouse.surname || null,
                    address: body.spouse.address || null,
                    idNumber: body.spouse.idNumber,
                    phoneNumber: body.spouse.phoneNumber || null,
                    email: body.spouse.email || null,
                  },
                },
              }
            : undefined,
        children:
          body.children && body.children.length > 0
            ? {
                deleteMany: {},
                create: body.children.map((child: any) => ({
                  firstName: child.firstName,
                  lastName: child.lastName,
                  surname: child.surname || null,
                  phoneNumber: child.phoneNumber || null,
                  dateOfBirth: new Date(child.dateOfBirth),
                  birthCertNo: child.birthCertNo,
                  idNumber: child.idNumber || null,
                })),
              }
            : undefined,
        nextOfKins:
          body.nextOfKins && body.nextOfKins.length > 0
            ? {
                deleteMany: {},
                create: body.nextOfKins.map((kin: any) => ({
                  firstName: kin.firstName,
                  lastName: kin.lastName,
                  surname: kin.surname || null,
                  idNumber: kin.idNumber,
                  address: kin.address || null,
                  phoneNumber: kin.phoneNumber || null,
                  email: kin.email || null,
                  relationship: kin.relationship,
                })),
              }
            : undefined,
        parentGuardians:
          body.parentGuardians && body.parentGuardians.length > 0
            ? {
                deleteMany: {},
                create: body.parentGuardians.map((pg: any) => ({
                  firstName: pg.firstName,
                  lastName: pg.lastName,
                  surname: pg.surname || null,
                  relationship: pg.relationship,
                  phoneNumber: pg.phoneNumber || null,
                })),
              }
            : undefined,
        parentsInLaws:
          body.parentsInLaws && body.parentsInLaws.length > 0
            ? {
                deleteMany: {},
                create: body.parentsInLaws.map((pil: any) => ({
                  firstName: pil.firstName,
                  lastName: pil.lastName,
                  surname: pil.surname || null,
                  relationship: pil.relationship,
                  phoneNumber: pil.phoneNumber || null,
                })),
              }
            : undefined,
      },
      include: {
        spouse: true,
        nextOfKins: true,
        children: true,
        parentGuardians: true,
        parentsInLaws: true,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.member.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
