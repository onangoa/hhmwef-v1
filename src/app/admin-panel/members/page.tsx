'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import MembersTable from '@/app/admin-panel/components/MembersTable';
import { MemberRecord } from '@/app/admin-panel/components/MemberDetailModal';

export default function AllMembersPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const mapDbMemberToUi = (dbMember: any, index: number): MemberRecord => ({
    id: dbMember.id,
    registrationNo: `REG/${new Date(dbMember.registrationDate).getFullYear()}/${String(index + 1).padStart(3, '0')}`,
    firstName: dbMember.firstName,
    lastName: dbMember.lastName,
    idNumber: dbMember.idNumber,
    dateOfBirth: dbMember.dateOfBirth,
    ministry: dbMember.ministry,
    department: dbMember.stateDepartment,
    payrollNumber: dbMember.payrollNumber,
    phone: dbMember.phoneNumber,
    alternativePhone: dbMember.alternativePhone,
    email: dbMember.email,
    postalAddress: dbMember.postalAddress,
    employmentStatus: dbMember.employmentStatus,
    memberStatus: dbMember.memberStatus,
    status:
      dbMember.memberStatus === 'ACTIVE'
        ? 'active'
        : dbMember.memberStatus === 'SUSPENDED'
          ? 'rejected'
          : 'pending',
    registeredAt: new Date(dbMember.registrationDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    approvalDate: dbMember.approvalDate
      ? new Date(dbMember.approvalDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : undefined,
    approvedBy: dbMember.approvedBy,
    mpesaConfirmation: dbMember.mpesaConfirmation,
    nextOfKinCount: dbMember.nextOfKins?.length || 0,
    hasSpouse: !!dbMember.spouse,
    spouse: dbMember.spouse
      ? {
          firstName: dbMember.spouse.firstName,
          lastName: dbMember.spouse.lastName,
          idNumber: dbMember.spouse.idNumber,
          phoneNumber: dbMember.spouse.phoneNumber,
          email: dbMember.spouse.email,
        }
      : undefined,
    childrenCount: dbMember.children?.length || 0,
    children: dbMember.children?.map((child: any) => ({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
    })),
    parentGuardians: dbMember.parentGuardians?.map((parent: any) => ({
      firstName: parent.firstName,
      lastName: parent.lastName,
      relationship: parent.relationship,
      phoneNumber: parent.phoneNumber,
      email: parent.email,
    })),
    parentsInLaw: dbMember.parentsInLaws?.map((parent: any) => ({
      firstName: parent.firstName,
      lastName: parent.lastName,
      relationship: parent.relationship,
      phoneNumber: parent.phoneNumber,
    })),
    nextOfKins: dbMember.nextOfKins?.map((kin: any) => ({
      firstName: kin.firstName,
      lastName: kin.lastName,
      relationship: kin.relationship,
      phoneNumber: kin.phoneNumber,
      email: kin.email,
    })),
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members?status=ACTIVE&limit=10000');
      if (response.ok) {
        const data = await response.json();
        const mappedMembers = (data.members || []).map((m: any, i: number) =>
          mapDbMemberToUi(m, i)
        );
        setMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">All Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered members
          </p>
        </div>
        <MembersTable members={members} loading={loading} onRefresh={fetchMembers} />
      </div>
    </AdminLayout>
  );
}
