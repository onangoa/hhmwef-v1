'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useUser } from '@/lib/user-context';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
  member?: {
    firstName: string;
    lastName: string;
    payrollNumber: string;
    ministry: string;
  };
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAdminData, setNewAdminData] = useState({ email: '', password: '', role: 'ADMIN' });
  const [assignMemberData, setAssignMemberData] = useState({ memberId: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminData),
      });

      if (response.ok) {
        toast.success('Admin user added successfully');
        setShowAddModal(false);
        setNewAdminData({ email: '', password: '', role: 'ADMIN' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add admin user');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin user');
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Admin user removed successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove admin user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to remove admin user');
    }
  };

  const handleAssignAdminRole = async () => {
    if (!assignMemberData.memberId) return;

    try {
      const response = await fetch(`/api/members/${assignMemberData.memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberStatus: 'ACTIVE' }),
      });

      if (response.ok) {
        toast.success('Member approved and set as admin');
        setShowAssignModal(false);
        setAssignMemberData({ memberId: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign admin role');
      }
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast.error('Failed to assign admin role');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const memberName = u.member ? `${u.member.firstName} ${u.member.lastName}`.toLowerCase() : '';
    return u.email.toLowerCase().includes(term) || memberName.includes(term);
  });

  if (!user || user.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You must be an admin to access this page.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Admin Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
                  Add, edit admin users, and assign admin roles to members
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Add Admin User
          </button>
        </div>
        <div className="bg-white rounded-lg shadow border border-border">
          <div className="p-4 border-b border-border">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.email}</p>
                    {user.member && (
                      <p className="text-xs text-muted-foreground">{user.member.firstName} {user.member.lastName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add Admin User</h2>
                <form onSubmit={handleAddAdmin}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={newAdminData.role}
                      onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value as 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER' })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="TREASURER">TREASURER</option>
                      <option value="SECRETARY">SECRETARY</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Edit User</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleEditUser(selectedUser.id, { email: selectedUser.email, role: selectedUser.role }); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER' })}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="TREASURER">TREASURER</option>
                      <option value="SECRETARY">SECRETARY</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      Update User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
