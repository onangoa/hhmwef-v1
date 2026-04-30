'use client';

import React, { useState, useEffect, useRef } from 'react';
import MemberLayout from '@/components/MemberLayout';
import { getUser, setUser } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Hash,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Heart,
  Baby,
  Users,
  UserPlus,
  Trash2,
  FileText,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

const MINISTRIES = [
  'Ministry of Finance & Economic Planning',
  'Ministry of Health',
  'Ministry of Education',
  'Ministry of Agriculture',
  'Ministry of Interior & National Administration',
  'Ministry of Foreign Affairs',
  'Ministry of Transport & Infrastructure',
  'Ministry of Energy & Petroleum',
  'Ministry of Environment & Forestry',
  'Ministry of Labour & Social Protection',
  'Ministry of Lands & Physical Planning',
  'Ministry of Water & Sanitation',
  'Ministry of Tourism & Wildlife',
  'Ministry of Mining & Blue Economy',
  'Ministry of ICT & Digital Economy',
];

const STATE_DEPARTMENTS: Record<string, string[]> = {
  'Ministry of Finance & Economic Planning': [
    'State Dept. of Economic Planning',
    'State Dept. of National Treasury',
    'State Dept. of Financial Services',
  ],
  'Ministry of Health': [
    'State Dept. of Medical Services',
    'State Dept. of Public Health',
    'State Dept. of Health Standards',
  ],
  'Ministry of Education': [
    'State Dept. of Basic Education',
    'State Dept. of Higher Education',
    'State Dept. of TVET',
  ],
  'Ministry of Agriculture': [
    'State Dept. of Crop Development',
    'State Dept. of Livestock',
    'State Dept. of Fisheries',
    'State Dept. of Irrigation',
  ],
  'Ministry of Interior & National Administration': [
    'State Dept. of Interior',
    'State Dept. of Correctional Services',
    'State Dept. of Immigration',
  ],
  'Ministry of Foreign Affairs': [
    'State Dept. of Foreign Affairs',
    'State Dept. of Diaspora Affairs',
  ],
  'Ministry of Transport & Infrastructure': [
    'State Dept. of Transport',
    'State Dept. of Infrastructure',
    'State Dept. of Public Works',
  ],
  'Ministry of Energy & Petroleum': ['State Dept. of Energy', 'State Dept. of Petroleum'],
  'Ministry of Environment & Forestry': ['State Dept. of Environment', 'State Dept. of Forestry'],
  'Ministry of Labour & Social Protection': [
    'State Dept. of Labour',
    'State Dept. of Social Protection',
  ],
  'Ministry of Lands & Physical Planning': [
    'State Dept. of Lands',
    'State Dept. of Physical Planning',
  ],
  'Ministry of Water & Sanitation': ['State Dept. of Water Services', 'State Dept. of Sanitation'],
  'Ministry of Tourism & Wildlife': ['State Dept. of Tourism', 'State Dept. of Wildlife'],
  'Ministry of Mining & Blue Economy': ['State Dept. of Mining', 'State Dept. of Blue Economy'],
  'Ministry of ICT & Digital Economy': [
    'State Dept. of ICT',
    'State Dept. of Digital Economy',
    'State Dept. of Broadcasting',
  ],
};

export default function ProfilePage() {
  const user = getUser();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    surname: '',
    idNumber: '',
    dateOfBirth: '',
    ministry: '',
    stateDepartment: '',
    payrollNumber: '',
    phoneNumber: '',
    alternativePhone: '',
    email: '',
    postalAddress: '',
    employmentStatus: '',
    spouse: {
      firstName: '',
      lastName: '',
      surname: '',
      idNumber: '',
      phoneNumber: '',
      email: '',
      address: '',
    },
    children: [] as any[],
    nextOfKins: [] as any[],
    parentGuardians: [] as any[],
    parentsInLaws: [] as any[],
  });

  useEffect(() => {
    fetchMember();
    if (user?.member?.id) {
      fetchDocuments();
    }
  }, []);

  const fetchMember = async () => {
    try {
      if (user?.member?.id) {
        const response = await fetch(`/api/members/${user.member.id}`);
        if (response.ok) {
          const data = await response.json();
          setMember(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            surname: data.surname || '',
            idNumber: data.idNumber,
            dateOfBirth: data.dateOfBirth,
            ministry: data.ministry,
            stateDepartment: data.stateDepartment,
            payrollNumber: data.payrollNumber,
            phoneNumber: data.phoneNumber,
            alternativePhone: data.alternativePhone || '',
            email: data.email,
            postalAddress: data.postalAddress || '',
            employmentStatus: data.employmentStatus,
            spouse: data.spouse || {
              firstName: '',
              lastName: '',
              surname: '',
              idNumber: '',
              phoneNumber: '',
              email: '',
              address: '',
            },
            children: data.children || [],
            nextOfKins: data.nextOfKins || [],
            parentGuardians: data.parentGuardians || [],
            parentsInLaws: data.parentsInLaws || [],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      toast.error('Failed to fetch member data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('=== handleSave called ===');

    try {
      if (!user?.member?.id) {
        console.error('No member ID found');
        toast.error('No member ID found');
        return;
      }

      console.log('Saving profile data:', formData);

      console.log('Member ID:', user?.member?.id);

      const response = await fetch(`/api/members/${user.member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const updatedMember = await response.json();
        toast.success('Profile updated successfully');
        setEditing(false);

        const updatedUser = {
          ...user,
          member: updatedMember,
        };
        setUser(updatedUser);

        fetchMember();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        surname: member.surname || '',
        idNumber: member.idNumber,
        dateOfBirth: member.dateOfBirth,
        ministry: member.ministry,
        stateDepartment: member.stateDepartment,
        payrollNumber: member.payrollNumber,
        phoneNumber: member.phoneNumber,
        alternativePhone: member.alternativePhone || '',
        email: member.email,
        postalAddress: member.postalAddress || '',
        employmentStatus: member.employmentStatus,
        spouse: member.spouse || {
          firstName: '',
          lastName: '',
          surname: '',
          idNumber: '',
          phoneNumber: '',
          email: '',
          address: '',
        },
        children: member.children || [],
        nextOfKins: member.nextOfKins || [],
        parentGuardians: member.parentGuardians || [],
        parentsInLaws: member.parentsInLaws || [],
      });
    }
  };

  const addChild = () => {
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        {
          firstName: '',
          lastName: '',
          surname: '',
          phoneNumber: '',
          dateOfBirth: '',
          birthCertNo: '',
          idNumber: '',
        },
      ],
    });
  };

  const removeChild = (index: number) => {
    setFormData({
      ...formData,
      children: formData.children.filter((_, i) => i !== index),
    });
  };

  const addNextOfKin = () => {
    setFormData({
      ...formData,
      nextOfKins: [
        ...formData.nextOfKins,
        {
          firstName: '',
          lastName: '',
          surname: '',
          idNumber: '',
          address: '',
          phoneNumber: '',
          email: '',
          relationship: '',
        },
      ],
    });
  };

  const removeNextOfKin = (index: number) => {
    setFormData({
      ...formData,
      nextOfKins: formData.nextOfKins.filter((_, i) => i !== index),
    });
  };

  const addParentGuardian = () => {
    setFormData({
      ...formData,
      parentGuardians: [
        ...formData.parentGuardians,
        {
          firstName: '',
          lastName: '',
          surname: '',
          relationship: '',
        },
      ],
    });
  };

  const removeParentGuardian = (index: number) => {
    setFormData({
      ...formData,
      parentGuardians: formData.parentGuardians.filter((_, i) => i !== index),
    });
  };

  const addParentInLaw = () => {
    setFormData({
      ...formData,
      parentsInLaws: [
        ...formData.parentsInLaws,
        {
          firstName: '',
          lastName: '',
          surname: '',
          relationship: '',
        },
      ],
    });
  };

  const fetchDocuments = async () => {
    try {
      if (user?.member?.id) {
        // Set a cookie with the user ID
        document.cookie = `user-id=${user.id}; path=/`;
        
        const response = await fetch(`/api/members/${user.member.id}/documents`);
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (file: File, documentType: string, description?: string) => {
    if (!user?.member?.id) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      if (description) {
        formData.append('description', description);
      }

      console.log('Upload Debug - User ID:', user.id);
      console.log('Upload Debug - Member ID:', user.member.id);

      // Set a cookie with the user ID as a fallback
      document.cookie = `user-id=${user.id}; path=/`;

      const response = await fetch(`/api/members/${user.member.id}/documents`, {
        method: 'POST',
        // Don't set headers when using FormData, use cookies instead
        body: formData,
      });

      console.log('Upload Debug - Response status:', response.status);

      if (response.ok) {
        const newDocument = await response.json();
        setDocuments([...documents, newDocument]);
        toast.success('Document uploaded successfully');
      } else {
        const error = await response.json();
        console.error('Upload Debug - Error response:', error);
        toast.error(error.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const documentType = prompt('Enter document type (ID, BIRTH_CERTIFICATE, PASSPORT, OTHER):');
      if (documentType) {
        const description = prompt('Enter description (optional):');
        handleFileUpload(file, documentType.toUpperCase(), description || undefined);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // Set a cookie with the user ID
      document.cookie = `user-id=${user.id}; path=/`;
      
      const response = await fetch(`/api/members/${user.member.id}/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const documentType = prompt('Enter document type (ID, BIRTH_CERTIFICATE, PASSPORT, OTHER):');
      if (documentType) {
        const description = prompt('Enter description (optional):');
        handleFileUpload(file, documentType.toUpperCase(), description || undefined);
      }
    }
  };

  const removeParentInLaw = (index: number) => {
    setFormData({
      ...formData,
      parentsInLaws: formData.parentsInLaws.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'spouse', label: 'Spouse', icon: Heart },
    { id: 'children', label: 'Children', icon: Baby },
    { id: 'nextOfKin', label: 'Next of Kin', icon: Users },
    { id: 'parents', label: 'Parent/Guardian', icon: User },
    { id: 'inLaws', label: 'Parents In Law', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  if (loading) {
    return (
      <MemberLayout>
        <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              View and update your personal information
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
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Save button clicked');
                  try {
                    handleSave();
                  } catch (err) {
                    console.error('Error calling handleSave:', err);
                    toast.error('Failed to save profile');
                  }
                }}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-border flex overflow-x-auto scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.firstName : member?.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.lastName : member?.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Surname
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.surname : member?.surname || ''}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        National ID
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.idNumber : member?.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={
                          editing
                            ? formData.dateOfBirth && formData.dateOfBirth.length > 0
                              ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                              : ''
                            : member?.dateOfBirth
                              ? new Date(member.dateOfBirth).toISOString().split('T')[0]
                              : ''
                        }
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
                        value={editing ? formData.email : member?.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editing ? formData.phoneNumber : member?.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Alternative Phone
                      </label>
                      <input
                        type="tel"
                        value={editing ? formData.alternativePhone : member?.alternativePhone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, alternativePhone: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Postal Address
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.postalAddress : member?.postalAddress || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, postalAddress: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Ministry
                      </label>
                      <select
                        value={editing ? formData.ministry : member?.ministry}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ministry: e.target.value,
                            stateDepartment: '',
                          })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      >
                        <option value="">Select Ministry</option>
                        {MINISTRIES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        State Department
                      </label>
                      <select
                        value={editing ? formData.stateDepartment : member?.stateDepartment}
                        onChange={(e) =>
                          setFormData({ ...formData, stateDepartment: e.target.value })
                        }
                        disabled={!editing || !formData.ministry}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      >
                        <option value="">Select Department</option>
                        {(formData.ministry ? STATE_DEPARTMENTS[formData.ministry] || [] : []).map(
                          (d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Payroll Number
                      </label>
                      <input
                        type="text"
                        value={editing ? formData.payrollNumber : member?.payrollNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, payrollNumber: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Employment Status
                      </label>
                      <select
                        value={editing ? formData.employmentStatus : member?.employmentStatus}
                        onChange={(e) =>
                          setFormData({ ...formData, employmentStatus: e.target.value })
                        }
                        disabled={!editing}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                      >
                        <option value="IN_SERVICE">In Service</option>
                        <option value="RETIREE">Retiree</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Member Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Status
                      </label>
                      <div className="px-3 py-2">
                        {member && (
                          <StatusBadge status={member.memberStatus.toLowerCase()} size="sm" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Registration Date
                      </label>
                      <div className="px-3 py-2 text-sm text-gray-600">
                        {new Date(member?.registrationDate).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spouse' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Spouse Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editing ? formData.spouse.firstName : member?.spouse?.firstName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, firstName: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editing ? formData.spouse.lastName : member?.spouse?.lastName || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, lastName: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Surname
                    </label>
                    <input
                      type="text"
                      value={editing ? formData.spouse.surname : member?.spouse?.surname || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, surname: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={editing ? formData.spouse.idNumber : member?.spouse?.idNumber || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, idNumber: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={
                        editing ? formData.spouse.phoneNumber : member?.spouse?.phoneNumber || ''
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, phoneNumber: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editing ? formData.spouse.email : member?.spouse?.email || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, email: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editing ? formData.spouse.address : member?.spouse?.address || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spouse: { ...formData.spouse, address: e.target.value },
                        })
                      }
                      disabled={!editing}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'children' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Children Information</h3>
                  {editing && (
                    <button
                      onClick={addChild}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <UserPlus size={14} />
                      Add Child
                    </button>
                  )}
                </div>

                {formData.children.length === 0 && !editing ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Baby size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No children information provided</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.children.map((child, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        {editing && (
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => removeChild(index)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-all"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={child.firstName}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].firstName = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={child.lastName}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].lastName = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Surname
                            </label>
                            <input
                              type="text"
                              value={child.surname || ''}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].surname = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={
                                child.dateOfBirth && child.dateOfBirth.length > 0
                                  ? new Date(child.dateOfBirth).toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].dateOfBirth = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Birth Certificate No
                            </label>
                            <input
                              type="text"
                              value={child.birthCertNo}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].birthCertNo = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              ID Number
                            </label>
                            <input
                              type="text"
                              value={child.idNumber || ''}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].idNumber = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={child.phoneNumber || ''}
                              onChange={(e) => {
                                const newChildren = [...formData.children];
                                newChildren[index].phoneNumber = e.target.value;
                                setFormData({ ...formData, children: newChildren });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nextOfKin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Next of Kin Information</h3>
                  {editing && (
                    <button
                      onClick={addNextOfKin}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <UserPlus size={14} />
                      Add Next of Kin
                    </button>
                  )}
                </div>

                {formData.nextOfKins.length === 0 && !editing ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No next of kin information provided</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.nextOfKins.map((kin, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        {editing && (
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => removeNextOfKin(index)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-all"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={kin.firstName}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].firstName = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={kin.lastName}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].lastName = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Surname
                            </label>
                            <input
                              type="text"
                              value={kin.surname || ''}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].surname = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={kin.relationship}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].relationship = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              ID Number
                            </label>
                            <input
                              type="text"
                              value={kin.idNumber}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].idNumber = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={kin.phoneNumber || ''}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].phoneNumber = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={kin.email || ''}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].email = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              value={kin.address || ''}
                              onChange={(e) => {
                                const newKins = [...formData.nextOfKins];
                                newKins[index].address = e.target.value;
                                setFormData({ ...formData, nextOfKins: newKins });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Parent/Guardian Information
                  </h3>
                  {editing && (
                    <button
                      onClick={addParentGuardian}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <UserPlus size={14} />
                      Add Parent/Guardian
                    </button>
                  )}
                </div>

                {formData.parentGuardians.length === 0 && !editing ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <User size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No parent/guardian information provided</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.parentGuardians.map((pg, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        {editing && (
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => removeParentGuardian(index)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-all"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={pg.firstName}
                              onChange={(e) => {
                                const newPG = [...formData.parentGuardians];
                                newPG[index].firstName = e.target.value;
                                setFormData({ ...formData, parentGuardians: newPG });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={pg.lastName}
                              onChange={(e) => {
                                const newPG = [...formData.parentGuardians];
                                newPG[index].lastName = e.target.value;
                                setFormData({ ...formData, parentGuardians: newPG });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Surname
                            </label>
                            <input
                              type="text"
                              value={pg.surname || ''}
                              onChange={(e) => {
                                const newPG = [...formData.parentGuardians];
                                newPG[index].surname = e.target.value;
                                setFormData({ ...formData, parentGuardians: newPG });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={pg.relationship}
                              onChange={(e) => {
                                const newPG = [...formData.parentGuardians];
                                newPG[index].relationship = e.target.value;
                                setFormData({ ...formData, parentGuardians: newPG });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inLaws' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Parents In Law Information
                  </h3>
                  {editing && (
                    <button
                      onClick={addParentInLaw}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <UserPlus size={14} />
                      Add Parent In Law
                    </button>
                  )}
                </div>

                {formData.parentsInLaws.length === 0 && !editing ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No parents in law information provided</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.parentsInLaws.map((pil, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        {editing && (
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => removeParentInLaw(index)}
                              className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-all"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={pil.firstName}
                              onChange={(e) => {
                                const newPIL = [...formData.parentsInLaws];
                                newPIL[index].firstName = e.target.value;
                                setFormData({ ...formData, parentsInLaws: newPIL });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={pil.lastName}
                              onChange={(e) => {
                                const newPIL = [...formData.parentsInLaws];
                                newPIL[index].lastName = e.target.value;
                                setFormData({ ...formData, parentsInLaws: newPIL });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Surname
                            </label>
                            <input
                              type="text"
                              value={pil.surname || ''}
                              onChange={(e) => {
                                const newPIL = [...formData.parentsInLaws];
                                newPIL[index].surname = e.target.value;
                                setFormData({ ...formData, parentsInLaws: newPIL });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Relationship
                            </label>
                            <input
                              type="text"
                              value={pil.relationship}
                              onChange={(e) => {
                                const newPIL = [...formData.parentsInLaws];
                                newPIL[index].relationship = e.target.value;
                                setFormData({ ...formData, parentsInLaws: newPIL });
                              }}
                              disabled={!editing}
                              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 disabled:text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Upload and manage your important documents such as ID, birth certificate, and other verification documents.
                  </p>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-blue-400 hover:bg-blue-50/40 bg-muted/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-base font-semibold text-foreground mb-2">
                      {uploading ? 'Uploading...' : 'Upload Documents'}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop your files here or click to browse
                    </p>
                    {!uploading && (
                      <button className="text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-all">
                        Select Files
                      </button>
                    )}
                    <div className="mt-4 text-xs text-muted-foreground">
                      <p>Supported formats: PDF, JPG, PNG (Max 5MB each)</p>
                      <p className="mt-1">Document types: ID, Birth Certificate, Passport, Other</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-foreground mb-4">Your Documents</h4>
                  {documents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="border border-border rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileText size={20} className="text-blue-600" />
                              <span className="text-sm font-medium text-foreground">
                                {doc.documentType.replace('_', ' ')}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 truncate">
                            {doc.originalName}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {doc.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          <button className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900">
                            View Document
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
