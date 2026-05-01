'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import MembersTable from '@/app/admin-panel/components/MembersTable';
import { MemberRecord } from '@/app/admin-panel/components/MemberDetailModal';

export default function PendingVerificationPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const mapDbMemberToUi = (dbMember: any, index: number): MemberRecord => ({
    id: dbMember.id,
    registrationNo: `REG/${new Date(dbMember.registrationDate).getFullYear()}/${String(index + 1).padStart(3, '0')}`,
    firstName: dbMember.firstName,
    lastName: dbMember.lastName,
    idNumber: dbMember.idNumber,
    ministry: dbMember.ministry,
    department: dbMember.stateDepartment,
    payrollNumber: dbMember.payrollNumber,
    phone: dbMember.phoneNumber,
    email: dbMember.email,
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
    mpesaConfirmation: undefined,
    nextOfKinCount: dbMember.nextOfKins?.length || 0,
    hasSpouse: !!dbMember.spouse,
    childrenCount: dbMember.children?.length || 0,
  });

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members?status=INACTIVE&limit=1000');
      if (response.ok) {
        const data = await response.json();
        const mappedMembers = (data.members || []).map((m: any, i: number) =>
          mapDbMemberToUi(m, i)
        );
        setMembers(mappedMembers);
      }
    } catch (error) {
      console.error('Error fetching pending members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Pending Verifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and verify member registrations awaiting approval
          </p>
        </div>
        <MembersTable members={members} loading={loading} onRefresh={fetchPendingMembers} />
      </div>
    </AdminLayout>
  );
}
