const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const prisma = new PrismaClient();

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
        idNumber: '12345678',
        dateOfBirth: new Date('1990-01-01'),
        ministry: 'Ministry of Health',
        stateDepartment: 'State Dept. of Medical Services',
        payrollNumber: 'PR/2024/00101',
        phoneNumber: '0712345678',
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
