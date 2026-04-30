import React from 'react';
import MemberLayout from '@/components/MemberLayout';
import { User, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';

export default function MemberDashboard() {
  return (
    <MemberLayout>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Member Portal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your membership and view contributions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/member-dashboard/profile"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">My Profile</h3>
            <p className="text-sm text-gray-600 mb-4">View and update your personal information</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              View Profile
            </button>
          </Link>

          <Link
            href="/member-dashboard/contributions"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Contributions</h3>
            <p className="text-sm text-gray-600 mb-4">View your contribution history and status</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">
              View Contributions
            </button>
          </Link>

          <Link
            href="/member-dashboard/welfare"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Welfare Cases</h3>
            <p className="text-sm text-gray-600 mb-4">View your welfare case applications</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              View Cases
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-600 text-sm">No recent activity to display.</p>
        </div>
      </div>
    </MemberLayout>
  );
}
