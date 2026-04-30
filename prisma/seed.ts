import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const prisma = new PrismaClient({});

async function main() {
  console.log('Starting database seed...');

  try {
    const adminPassword = await hashPassword('Admin123!');

    const adminMember = await prisma.member.create({
      data: {
        firstName: 'System',
        lastName: 'Administrator',
        idNumber: '00000000',
        dateOfBirth: new Date('1980-01-01'),
        ministry: 'Ministry of ICT & Digital Economy',
        stateDepartment: 'State Dept. of ICT',
        payrollNumber: 'ADMIN/001',
        phoneNumber: '0700000000',
        email: 'admin@memberreg.com',
        postalAddress: 'P.O. Box 00000, Nairobi',
        hasAgreedToTerms: true,
        employmentStatus: 'IN_SERVICE',
        memberStatus: 'ACTIVE',
        approvalDate: new Date(),
        approvedBy: 'SYSTEM',
        groupRole: 'ADMIN',
        nextOfKins: {
          create: [
            {
              firstName: 'Jane',
              lastName: 'Doe',
              idNumber: '87654321',
              address: 'P.O. Box 11111-00100, Nairobi',
              phoneNumber: '0711111111',
              email: 'jane.doe@example.com',
              relationship: 'Spouse',
            },
          ],
        },
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@memberreg.com',
        password: adminPassword,
        role: 'ADMIN',
        memberId: adminMember.id,
        mustChangePassword: true,
        lastPasswordChange: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n========================================');
    console.log('🔑 Admin Credentials:');
    console.log('========================================');
    console.log('  Email:    admin@memberreg.com');
    console.log('  Password: Admin123!');
    console.log('========================================');
    console.log('\n⚠️  Please change the default password after first login!\n');

    const testMember = await prisma.member.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        surname: 'Test',
        idNumber: '00000001',
        dateOfBirth: new Date('1990-01-01'),
        ministry: 'Ministry of Health',
        stateDepartment: 'State Dept. of Medical Services',
        payrollNumber: 'TEST/001',
        phoneNumber: '0711111111',
        email: 'onangoa@gmail.com',
        postalAddress: 'P.O. Box 12345-00100, Nairobi',
        hasAgreedToTerms: true,
        employmentStatus: 'IN_SERVICE',
        memberStatus: 'ACTIVE',
        approvalDate: new Date(),
        approvedBy: 'SYSTEM',
      },
    });

    const testPassword = await hashPassword('Member123!');

    await prisma.user.create({
      data: {
        email: 'onangoa@gmail.com',
        password: testPassword,
        role: 'MEMBER',
        memberId: testMember.id,
        mustChangePassword: true,
        lastPasswordChange: new Date(),
      },
    });

    console.log('✅ Test member user created successfully!');
    console.log('\n========================================');
    console.log('🔑 Test Member Credentials:');
    console.log('========================================');
    console.log('  Email:    onangoa@gmail.com');
    console.log('  Password: Member123!');
    console.log('========================================\n');

    const dummyMembers = [
      {
        firstName: 'James',
        lastName: 'Mwangi',
        idNumber: '12345678',
        dateOfBirth: new Date('1985-05-15'),
        ministry: 'Ministry of Health',
        stateDepartment: 'State Dept. of Medical Services',
        payrollNumber: 'PR/2024/00101',
        phoneNumber: '0712345678',
        email: 'james.mwangi@health.go.ke',
        postalAddress: 'P.O. Box 23456-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
      {
        firstName: 'Grace',
        lastName: 'Wanjiru',
        idNumber: '23456789',
        dateOfBirth: new Date('1990-08-22'),
        ministry: 'Ministry of Education',
        stateDepartment: 'State Dept. of Basic Education',
        payrollNumber: 'PR/2024/00102',
        phoneNumber: '0723456789',
        email: 'grace.wanjiru@education.go.ke',
        postalAddress: 'P.O. Box 34567-00100, Nairobi',
        memberStatus: 'INACTIVE' as const,
      },
      {
        firstName: 'Peter',
        lastName: 'Ochieng',
        idNumber: '34567890',
        dateOfBirth: new Date('1988-03-10'),
        ministry: 'Ministry of Finance & Economic Planning',
        stateDepartment: 'State Dept. of National Treasury',
        payrollNumber: 'PR/2024/00103',
        phoneNumber: '0733567890',
        email: 'peter.ochieng@treasury.go.ke',
        postalAddress: 'P.O. Box 45678-00100, Nairobi',
        memberStatus: 'INACTIVE' as const,
      },
      {
        firstName: 'Mary',
        lastName: 'Njeri',
        idNumber: '45678901',
        dateOfBirth: new Date('1992-11-28'),
        ministry: 'Ministry of Agriculture',
        stateDepartment: 'State Dept. of Crop Development',
        payrollNumber: 'PR/2024/00104',
        phoneNumber: '0744678901',
        email: 'mary.njeri@agriculture.go.ke',
        postalAddress: 'P.O. Box 56789-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
      {
        firstName: 'Samuel',
        lastName: 'Kipchoge',
        idNumber: '56789012',
        dateOfBirth: new Date('1987-07-03'),
        ministry: 'Ministry of Interior & National Administration',
        stateDepartment: 'State Dept. of Interior',
        payrollNumber: 'PR/2024/00105',
        phoneNumber: '0755789012',
        email: 'samuel.kipchoge@interior.go.ke',
        postalAddress: 'P.O. Box 67890-00100, Nairobi',
        memberStatus: 'SUSPENDED' as const,
      },
      {
        firstName: 'Faith',
        lastName: 'Achieng',
        idNumber: '67890123',
        dateOfBirth: new Date('1991-12-19'),
        ministry: 'Ministry of Health',
        stateDepartment: 'State Dept. of Public Health',
        payrollNumber: 'PR/2024/00106',
        phoneNumber: '0766890123',
        email: 'faith.achieng@health.go.ke',
        postalAddress: 'P.O. Box 78901-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
      {
        firstName: 'David',
        lastName: 'Kamau',
        idNumber: '78901234',
        dateOfBirth: new Date('1989-09-14'),
        ministry: 'Ministry of Transport & Infrastructure',
        stateDepartment: 'State Dept. of Transport',
        payrollNumber: 'PR/2024/00107',
        phoneNumber: '0777901234',
        email: 'david.kamau@transport.go.ke',
        postalAddress: 'P.O. Box 89012-00100, Nairobi',
        memberStatus: 'INACTIVE' as const,
      },
      {
        firstName: 'Esther',
        lastName: 'Mutua',
        idNumber: '89012345',
        dateOfBirth: new Date('1993-04-05'),
        ministry: 'Ministry of ICT & Digital Economy',
        stateDepartment: 'State Dept. of ICT',
        payrollNumber: 'PR/2024/00108',
        phoneNumber: '0788012345',
        email: 'esther.mutua@ict.go.ke',
        postalAddress: 'P.O. Box 90123-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
      {
        firstName: 'Joseph',
        lastName: 'Otieno',
        idNumber: '90123456',
        dateOfBirth: new Date('1986-06-30'),
        ministry: 'Ministry of Energy & Petroleum',
        stateDepartment: 'State Dept. of Energy',
        payrollNumber: 'PR/2024/00109',
        phoneNumber: '0799123456',
        email: 'joseph.otieno@energy.go.ke',
        postalAddress: 'P.O. Box 01234-00100, Nairobi',
        memberStatus: 'INACTIVE' as const,
      },
      {
        firstName: 'Caroline',
        lastName: 'Wambua',
        idNumber: '01234567',
        dateOfBirth: new Date('1994-02-17'),
        ministry: 'Ministry of Labour & Social Protection',
        stateDepartment: 'State Dept. of Labour',
        payrollNumber: 'PR/2024/00110',
        phoneNumber: '0700234567',
        email: 'caroline.wambua@labour.go.ke',
        postalAddress: 'P.O. Box 12345-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
      {
        firstName: 'Michael',
        lastName: 'Njoroge',
        idNumber: '11234567',
        dateOfBirth: new Date('1990-10-08'),
        ministry: 'Ministry of Education',
        stateDepartment: 'State Dept. of Higher Education',
        payrollNumber: 'PR/2024/00111',
        phoneNumber: '0711234567',
        email: 'michael.njoroge@education.go.ke',
        postalAddress: 'P.O. Box 23456-00100, Nairobi',
        memberStatus: 'INACTIVE' as const,
      },
      {
        firstName: 'Beatrice',
        lastName: 'Adhiambo',
        idNumber: '22345678',
        dateOfBirth: new Date('1988-01-25'),
        ministry: 'Ministry of Environment & Forestry',
        stateDepartment: 'State Dept. of Environment',
        payrollNumber: 'PR/2024/00112',
        phoneNumber: '0722345678',
        email: 'beatrice.adhiambo@environment.go.ke',
        postalAddress: 'P.O. Box 34567-00100, Nairobi',
        memberStatus: 'ACTIVE' as const,
        approvalDate: new Date(),
      },
    ];

    for (const memberData of dummyMembers) {
      await prisma.member.create({
        data: {
          ...memberData,
          hasAgreedToTerms: true,
          employmentStatus: 'IN_SERVICE',
        },
      });
    }

    console.log(`✅ Created ${dummyMembers.length} dummy members successfully!`);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
