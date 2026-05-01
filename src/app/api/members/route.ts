import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const ministry = searchParams.get('ministry');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.memberStatus = status;
    }

    if (ministry) {
      where.ministry = ministry;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { payrollNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          spouse: true,
          nextOfKins: true,
          children: true,
          parentGuardians: true,
          parentsInLaws: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const member = await prisma.member.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        surname: body.surname || null,
        idNumber: body.idNumber,
        dateOfBirth: new Date(body.dateOfBirth),
        ministry: body.ministry,
        stateDepartment: body.stateDepartment,
        payrollNumber: body.payrollNumber,
        phoneNumber: body.phoneNumber,
        alternativePhone: body.alternativePhone || null,
        email: body.email,
        postalAddress: body.postalAddress || null,
        hasAgreedToTerms: body.agreedToTerms || false,
        employmentStatus: body.employmentStatus || 'IN_SERVICE',
        memberStatus: 'INACTIVE',
        mpesaConfirmation: body.mpesaConfirmation || null,
        nextOfKins: body.nextOfKins
          ? {
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
        spouse: body.spouse
          ? {
              create: {
                firstName: body.spouse.firstName,
                lastName: body.spouse.lastName,
                surname: body.spouse.surname || null,
                address: body.spouse.address || null,
                idNumber: body.spouse.idNumber,
                phoneNumber: body.spouse.phoneNumber || null,
                email: body.spouse.email || null,
              },
            }
          : undefined,
        children:
          body.children && body.children.length > 0
            ? {
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
        parentGuardians:
          body.parentGuardians && body.parentGuardians.length > 0
            ? {
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
 
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
