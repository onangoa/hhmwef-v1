#!/usr/bin/env python3

import re

# Read the file
with open('/home/antony/projects/memberreg/src/app/api/members/route.ts', 'r') as f:
    content = f.read()

# Define the new membersWithStatus code
new_members_with_status = '''    const membersWithStatus = members.map((m, index) => ({
      ...m,
      id: m.id,
      registrationNo: `REG/${new Date(m.registrationDate).getFullYear()}/${index + 1}`,
      firstName: m.firstName,
      lastName: m.lastName,
      idNumber: m.idNumber,
      dateOfBirth: m.dateOfBirth,
      ministry: m.ministry,
      department: m.stateDepartment,
      payrollNumber: m.payrollNumber,
      phone: m.phoneNumber,
      alternativePhone: m.alternativePhone,
      email: m.email,
      postalAddress: m.postalAddress,
      employmentStatus: m.employmentStatus,
      memberStatus: m.memberStatus,
      status:
        m.memberStatus === 'ACTIVE'
          ? 'active'
          : m.memberStatus === 'SUSPENDED'
            ? 'rejected'
            : 'pending',
      registeredAt: new Date(m.registrationDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      approvalDate: m.approvalDate ? new Date(m.approvalDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) : null,
      approvedBy: m.approvedBy || null,
      spouse: m.spouse
        ? {
            firstName: m.spouse.firstName,
            lastName: m.spouse.lastName,
            idNumber: m.spouse.idNumber,
            phoneNumber: m.spouse.phoneNumber,
            email: m.spouse.email,
          }
        : null,
      childrenCount: m.children.length,
      children: m.children.map((child) => ({
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
      })),
      nextOfKinCount: m.nextOfKins.length,
      parentGuardians: m.parentGuardians,
      parentsInLaw: m.parentsInLaw,
    }));

    return NextResponse.json({'''

# Find and replace the old membersWithStatus block
# Looking for the block that starts with "const membersWithStatus" and ends before the return statement for the GET function
pattern = r'const members = await Promise\.all\(\[.*?\].*?prisma\.member\.findMany\(\{.*?include: \{.*?\n.*?select: \{.*?\n.*?}\}.*?\n.*?\n.*?\}.*?\n.*?\n.*?\n.*?\}\)\.+)\n.*?\].*?prisma\.member\.count.*?\}\n.*?return NextResponse\.json\(\{'
pattern_end = r',\s*pagination:.*?\}\s*\n.*?catch.*?\}'

match = re.search(pattern, content, re.MULTILINE | re.DOTALL)

if match:
    content = content[:match.start()] + new_members_with_status + match.group() + content[match.end():]
    
# Write the updated content
with open('/home/antony/projects/memberreg/src/app/api/members/route.ts', 'w') as f:
    f.write(content)

print("Successfully updated members route")
