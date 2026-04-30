'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getUser, setUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Shield,
  Edit2,
  Save,
  X,
} from 'lucide-react';

export default function AdminProfilePage() {
  const user = getUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.email?.split('@')[0] || '',
  });

  const handleSave = async () => {
    try {
      toast.success('Profile updated successfully');
      setEditing(false);
      setUser({
        ...user,
        email: formData.email,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      email: user?.email || '',
      firstName: user?.email?.split('@')[0] || '',
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View and update your account information
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 rounded-lg transition-all"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editing ? formData.firstName : user?.email?.split('@')[0] || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!editing}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editing ? formData.email : user?.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Role
                  </label>
                  <div className="px-3 py-2">
                    <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full text-sm font-semibold">
                      <Shield size={14} />
                      {user?.role || 'ADMIN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
