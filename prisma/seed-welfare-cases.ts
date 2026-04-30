import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWelfareCases() {
  console.log('🌱 Seeding welfare cases...');

  const members = await prisma.member.findMany();
  if (members.length === 0) {
    console.log('⚠️  No members found. Please seed members first.');
    return;
  }

  const member1 = members[0];
  const member2 = members[1] || members[0];
  const member3 = members[2] || members[0];
  const member4 = members[3] || members[0];
  const member5 = members[4] || members[0];

  const currentYear = new Date().getFullYear();

  const welfareCases: any[] = [
    {
      caseNumber: `WC/${currentYear}/001`,
      type: 'MEDICAL',
      status: 'DISBURSED',
      memberId: member1.id,
      title: 'Cardiac Surgery — Kenyatta National Hospital',
      description:
        'Member requires urgent cardiac bypass surgery. Total hospital bill is Ksh 180,000. Requesting welfare support to cover the shortfall after NHIF.',
      amountRequested: 80000,
      amountApproved: 75000,
      supportingDocs: ['Admission Letter.pdf', 'Hospital Bill.pdf', 'NHIF Statement.pdf'],
      createdAt: new Date('2026-04-10'),
      updatedAt: new Date('2026-04-20'),
    },
    {
      caseNumber: `WC/${currentYear}/002`,
      type: 'BEREAVEMENT',
      status: 'APPROVED',
      memberId: member2.id,
      title: 'Loss of Spouse — Funeral Expenses',
      description:
        'Member lost her husband on 18 April 2026. Requesting bereavement support for funeral and burial expenses.',
      amountRequested: 50000,
      amountApproved: 50000,
      supportingDocs: ['Death Certificate.pdf', 'Burial Permit.pdf'],
      createdAt: new Date('2026-04-19'),
      updatedAt: new Date('2026-04-22'),
    },
    {
      caseNumber: `WC/${currentYear}/003`,
      type: 'EMERGENCY',
      status: 'UNDER_REVIEW',
      memberId: member3.id,
      title: 'Fire Disaster — Home Destroyed',
      description:
        "Member's house was destroyed by fire on 21 April 2026. Family of 4 displaced. Requesting emergency support for temporary shelter and basic needs.",
      amountRequested: 60000,
      amountApproved: 0,
      supportingDocs: ['Fire Incident Report.pdf', "Chief's Letter.pdf"],
      createdAt: new Date('2026-04-22'),
      updatedAt: new Date('2026-04-23'),
    },
    {
      caseNumber: `WC/${currentYear}/004`,
      type: 'MEDICAL',
      status: 'PENDING',
      memberId: member4.id,
      title: 'Child Hospitalization — Nairobi Hospital',
      description:
        "Member's child (age 5) admitted for acute malaria with complications. Hospital bill estimated at Ksh 45,000. Requesting welfare support.",
      amountRequested: 35000,
      amountApproved: 0,
      supportingDocs: ['Admission Note.pdf'],
      createdAt: new Date('2026-04-23'),
      updatedAt: new Date('2026-04-23'),
    },
    {
      caseNumber: `WC/${currentYear}/005`,
      type: 'BEREAVEMENT',
      status: 'REJECTED',
      memberId: member5.id,
      title: 'Loss of Parent — Burial Support',
      description: 'Member lost his father. Requesting bereavement support.',
      amountRequested: 30000,
      amountApproved: 0,
      supportingDocs: ['Death Certificate.pdf'],
      createdAt: new Date('2026-04-05'),
      updatedAt: new Date('2026-04-10'),
    },
  ];

  for (const welfareCase of welfareCases) {
    const existing = await prisma.welfareCase.findUnique({
      where: { caseNumber: welfareCase.caseNumber },
    });

    if (!existing) {
      await prisma.welfareCase.create({ data: welfareCase });
      console.log(`✅ Created welfare case: ${welfareCase.caseNumber}`);
    } else {
      console.log(`⏭️  Welfare case already exists: ${welfareCase.caseNumber}`);
    }
  }

  console.log('🎉 Welfare cases seeded successfully!');
}

seedWelfareCases()
  .catch((e) => {
    console.error('❌ Error seeding welfare cases:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
