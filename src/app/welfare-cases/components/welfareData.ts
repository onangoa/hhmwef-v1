export type CaseType = 'medical' | 'bereavement' | 'emergency';
export type CaseStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';
export type ApprovalDecision = 'approved' | 'rejected' | 'deferred';

export interface CommitteeDecision {
  id: string;
  memberName: string;
  role: string;
  decision: ApprovalDecision;
  comment: string;
  decidedAt: string;
}

export interface Disbursement {
  id: string;
  amount: number;
  method: string;
  reference: string;
  disbursedAt: string;
  disbursedBy: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  contributedAt: string;
  method: string;
}

export interface WelfareCase {
  id: string;
  caseNumber: string;
  type: CaseType;
  status: CaseStatus;
  memberId: string;
  memberName: string;
  memberPayroll: string;
  ministry: string;
  title: string;
  description: string;
  amountRequested: number;
  amountApproved: number;
  createdAt: string;
  updatedAt: string;
  committeeDecisions: CommitteeDecision[];
  disbursements: Disbursement[];
  contributions: Contribution[];
  supportingDocs: string[];
}

export const MOCK_WELFARE_CASES: WelfareCase[] = [
  {
    id: 'wc-001',
    caseNumber: 'WC/2026/001',
    type: 'medical',
    status: 'disbursed',
    memberId: 'member-001',
    memberName: 'James Mwangi',
    memberPayroll: 'PR/2024/00101',
    ministry: 'Ministry of Health',
    title: 'Cardiac Surgery — Kenyatta National Hospital',
    description:
      'Member requires urgent cardiac bypass surgery. Total hospital bill is Ksh 180,000. Requesting welfare support to cover the shortfall after NHIF.',
    amountRequested: 80000,
    amountApproved: 75000,
    createdAt: '10 Apr 2026',
    updatedAt: '20 Apr 2026',
    committeeDecisions: [
      {
        id: 'cd-001a',
        memberName: 'Sarah Otieno',
        role: 'Chairperson',
        decision: 'approved',
        comment: 'Verified hospital admission documents. Recommend full approval.',
        decidedAt: '12 Apr 2026',
      },
      {
        id: 'cd-001b',
        memberName: 'John Kamau',
        role: 'Secretary',
        decision: 'approved',
        comment: 'Documents in order. Approved.',
        decidedAt: '13 Apr 2026',
      },
      {
        id: 'cd-001c',
        memberName: 'Rose Njeri',
        role: 'Treasurer',
        decision: 'approved',
        comment: 'Funds available. Approved Ksh 75,000 after review.',
        decidedAt: '14 Apr 2026',
      },
    ],
    disbursements: [
      {
        id: 'dis-001',
        amount: 75000,
        method: 'Bank Transfer',
        reference: 'TXN/2026/KNH/001',
        disbursedAt: '20 Apr 2026',
        disbursedBy: 'Rose Njeri (Treasurer)',
      },
    ],
    contributions: [
      {
        id: 'con-001a',
        memberId: 'member-002',
        memberName: 'Grace Wanjiru',
        amount: 500,
        contributedAt: '15 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-001b',
        memberId: 'member-004',
        memberName: 'Mary Njeri',
        amount: 500,
        contributedAt: '15 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-001c',
        memberId: 'member-006',
        memberName: 'Faith Achieng',
        amount: 500,
        contributedAt: '16 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-001d',
        memberId: 'member-008',
        memberName: 'Esther Mutua',
        amount: 500,
        contributedAt: '16 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-001e',
        memberId: 'member-010',
        memberName: 'Caroline Wambua',
        amount: 500,
        contributedAt: '17 Apr 2026',
        method: 'M-Pesa',
      },
    ],
    supportingDocs: ['Admission Letter.pdf', 'Hospital Bill.pdf', 'NHIF Statement.pdf'],
  },
  {
    id: 'wc-002',
    caseNumber: 'WC/2026/002',
    type: 'bereavement',
    status: 'approved',
    memberId: 'member-004',
    memberName: 'Mary Njeri',
    memberPayroll: 'PR/2024/00104',
    ministry: 'Ministry of Agriculture',
    title: 'Loss of Spouse — Funeral Expenses',
    description:
      'Member lost her husband on 18 April 2026. Requesting bereavement support for funeral and burial expenses.',
    amountRequested: 50000,
    amountApproved: 50000,
    createdAt: '19 Apr 2026',
    updatedAt: '22 Apr 2026',
    committeeDecisions: [
      {
        id: 'cd-002a',
        memberName: 'Sarah Otieno',
        role: 'Chairperson',
        decision: 'approved',
        comment: 'Death certificate verified. Full bereavement package approved.',
        decidedAt: '21 Apr 2026',
      },
      {
        id: 'cd-002b',
        memberName: 'John Kamau',
        role: 'Secretary',
        decision: 'approved',
        comment: 'Condolences. Approved.',
        decidedAt: '21 Apr 2026',
      },
      {
        id: 'cd-002c',
        memberName: 'Rose Njeri',
        role: 'Treasurer',
        decision: 'approved',
        comment: 'Approved. Disbursement pending.',
        decidedAt: '22 Apr 2026',
      },
    ],
    disbursements: [],
    contributions: [
      {
        id: 'con-002a',
        memberId: 'member-001',
        memberName: 'James Mwangi',
        amount: 500,
        contributedAt: '20 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-002b',
        memberId: 'member-006',
        memberName: 'Faith Achieng',
        amount: 500,
        contributedAt: '20 Apr 2026',
        method: 'M-Pesa',
      },
      {
        id: 'con-002c',
        memberId: 'member-007',
        memberName: 'David Kamau',
        amount: 500,
        contributedAt: '21 Apr 2026',
        method: 'M-Pesa',
      },
    ],
    supportingDocs: ['Death Certificate.pdf', 'Burial Permit.pdf'],
  },
  {
    id: 'wc-003',
    caseNumber: 'WC/2026/003',
    type: 'emergency',
    status: 'under_review',
    memberId: 'member-007',
    memberName: 'David Kamau',
    memberPayroll: 'PR/2024/00107',
    ministry: 'Ministry of Transport & Infrastructure',
    title: 'Fire Disaster — Home Destroyed',
    description:
      "Member's house was destroyed by fire on 21 April 2026. Family of 4 displaced. Requesting emergency support for temporary shelter and basic needs.",
    amountRequested: 60000,
    amountApproved: 0,
    createdAt: '22 Apr 2026',
    updatedAt: '23 Apr 2026',
    committeeDecisions: [
      {
        id: 'cd-003a',
        memberName: 'Sarah Otieno',
        role: 'Chairperson',
        decision: 'approved',
        comment: 'Verified fire incident report from local chief. Recommend approval.',
        decidedAt: '23 Apr 2026',
      },
      {
        id: 'cd-003b',
        memberName: 'John Kamau',
        role: 'Secretary',
        decision: 'deferred',
        comment: 'Need additional documentation — insurance claim status.',
        decidedAt: '23 Apr 2026',
      },
    ],
    disbursements: [],
    contributions: [
      {
        id: 'con-003a',
        memberId: 'member-002',
        memberName: 'Grace Wanjiru',
        amount: 500,
        contributedAt: '23 Apr 2026',
        method: 'M-Pesa',
      },
    ],
    supportingDocs: ['Fire Incident Report.pdf', "Chief's Letter.pdf"],
  },
  {
    id: 'wc-004',
    caseNumber: 'WC/2026/004',
    type: 'medical',
    status: 'pending',
    memberId: 'member-009',
    memberName: 'Joseph Otieno',
    memberPayroll: 'PR/2024/00109',
    ministry: 'Ministry of Energy & Petroleum',
    title: 'Child Hospitalization — Nairobi Hospital',
    description:
      "Member's child (age 5) admitted for acute malaria with complications. Hospital bill estimated at Ksh 45,000. Requesting welfare support.",
    amountRequested: 35000,
    amountApproved: 0,
    createdAt: '23 Apr 2026',
    updatedAt: '23 Apr 2026',
    committeeDecisions: [],
    disbursements: [],
    contributions: [],
    supportingDocs: ['Admission Note.pdf'],
  },
  {
    id: 'wc-005',
    caseNumber: 'WC/2026/005',
    type: 'bereavement',
    status: 'rejected',
    memberId: 'member-011',
    memberName: 'Michael Njoroge',
    memberPayroll: 'PR/2024/00111',
    ministry: 'Ministry of Education',
    title: 'Loss of Parent — Burial Support',
    description: 'Member lost his father. Requesting bereavement support.',
    amountRequested: 30000,
    amountApproved: 0,
    createdAt: '5 Apr 2026',
    updatedAt: '10 Apr 2026',
    committeeDecisions: [
      {
        id: 'cd-005a',
        memberName: 'Sarah Otieno',
        role: 'Chairperson',
        decision: 'rejected',
        comment:
          'Member has not completed 6-month membership requirement for bereavement benefits.',
        decidedAt: '10 Apr 2026',
      },
      {
        id: 'cd-005b',
        memberName: 'John Kamau',
        role: 'Secretary',
        decision: 'rejected',
        comment: 'Concur with chairperson. Ineligible at this time.',
        decidedAt: '10 Apr 2026',
      },
    ],
    disbursements: [],
    contributions: [],
    supportingDocs: ['Death Certificate.pdf'],
  },
];
