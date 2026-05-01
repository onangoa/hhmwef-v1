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
        email: 'admin@hhswelfare.co.ke',
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
        email: 'admin@hhswelfare.co.ke',
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
    console.log('  Email:    admin@hhswelfare.co.ke');
    console.log('  Password: Admin123!');
    console.log('========================================');
    console.log('\n⚠️  Please change the default password after first login!\n');

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
