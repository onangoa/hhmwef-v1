'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Users, 
  Heart, 
  Baby, 
  Home,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'nextOfKin', label: 'Next of Kin', icon: Users },
  { id: 'spouse', label: 'Spouse', icon: Heart },
  { id: 'children', label: 'Children', icon: Baby },
  { id: 'parents', label: 'Parents', icon: Home },
];

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    async function fetchMember() {
      try {
        const response = await fetch(`/api/members/${memberId}`);
        if (!response.ok) throw new Error('Failed to fetch member');
        const data = await response.json();
        
        // Format dates for input fields
        if (data.dateOfBirth) {
          data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split('T')[0];
        }
        if (data.children) {
          data.children = data.children.map((c: any) => ({
            ...c,
            dateOfBirth: new Date(c.dateOfBirth).toISOString().split('T')[0],
          }));
        }
        
        setFormData(data);
      } catch (error) {
        console.error(error);
        toast.error('Could not load member data');
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, [memberId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (category: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleArrayChange = (category: string, index: number, field: string, value: any) => {
    const newArray = [...formData[category]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, [category]: newArray }));
  };

  const addArrayItem = (category: string, template: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: [...(prev[category] || []), template],
    }));
  };

  const removeArrayItem = (category: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: prev[category].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save changes');
      
      toast.success('Member details updated successfully');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!formData) return null;

  const inputClass = "w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

  return (
    <AdminLayout>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin-panel/members"
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Member</h1>
              <p className="text-sm text-muted-foreground">
                Updating profile for <span className="font-semibold text-blue-600">{formData.firstName} {formData.lastName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First Name</label>
                <input 
                  type="text" name="firstName" value={formData.firstName || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input 
                  type="text" name="lastName" value={formData.lastName || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Surname</label>
                <input 
                  type="text" name="surname" value={formData.surname || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" name="email" value={formData.email || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input 
                  type="text" name="phoneNumber" value={formData.phoneNumber || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>ID Number</label>
                <input 
                  type="text" name="idNumber" value={formData.idNumber || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Payroll Number</label>
                <input 
                  type="text" name="payrollNumber" value={formData.payrollNumber || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input 
                  type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Ministry</label>
                <input 
                  type="text" name="ministry" value={formData.ministry || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>State Department</label>
                <input 
                  type="text" name="stateDepartment" value={formData.stateDepartment || ''} 
                  onChange={handleInputChange} className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Member Status</label>
                <select 
                  name="memberStatus" value={formData.memberStatus} 
                  onChange={handleInputChange} className={inputClass}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'nextOfKin' && (
            <div className="space-y-6">
              {(formData.nextOfKins || []).map((kin: any, index: number) => (
                <div key={index} className="p-4 border border-border rounded-xl relative">
                  <button 
                    onClick={() => removeArrayItem('nextOfKins', index)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    Remove
                  </button>
                  <h3 className="text-sm font-bold mb-4">Next of Kin #{index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input 
                        type="text" value={kin.firstName || ''} 
                        onChange={(e) => handleArrayChange('nextOfKins', index, 'firstName', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input 
                        type="text" value={kin.lastName || ''} 
                        onChange={(e) => handleArrayChange('nextOfKins', index, 'lastName', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <input 
                        type="text" value={kin.relationship || ''} 
                        onChange={(e) => handleArrayChange('nextOfKins', index, 'relationship', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input 
                        type="text" value={kin.phoneNumber || ''} 
                        onChange={(e) => handleArrayChange('nextOfKins', index, 'phoneNumber', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => addArrayItem('nextOfKins', { firstName: '', lastName: '', relationship: '', phoneNumber: '' })}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                + Add Next of Kin
              </button>
            </div>
          )}

          {activeTab === 'spouse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                <Heart size={18} />
                If the member has no spouse, leave these fields empty.
              </div>
              <div>
                <label className={labelClass}>Spouse First Name</label>
                <input 
                  type="text" value={formData.spouse?.firstName || ''} 
                  onChange={(e) => handleNestedChange('spouse', 'firstName', e.target.value)} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Spouse Last Name</label>
                <input 
                  type="text" value={formData.spouse?.lastName || ''} 
                  onChange={(e) => handleNestedChange('spouse', 'lastName', e.target.value)} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>ID Number</label>
                <input 
                  type="text" value={formData.spouse?.idNumber || ''} 
                  onChange={(e) => handleNestedChange('spouse', 'idNumber', e.target.value)} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input 
                  type="text" value={formData.spouse?.phoneNumber || ''} 
                  onChange={(e) => handleNestedChange('spouse', 'phoneNumber', e.target.value)} 
                  className={inputClass} 
                />
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="space-y-6">
              {(formData.children || []).map((child: any, index: number) => (
                <div key={index} className="p-4 border border-border rounded-xl relative">
                  <button 
                    onClick={() => removeArrayItem('children', index)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    Remove
                  </button>
                  <h3 className="text-sm font-bold mb-4">Child #{index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input 
                        type="text" value={child.firstName || ''} 
                        onChange={(e) => handleArrayChange('children', index, 'firstName', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input 
                        type="text" value={child.lastName || ''} 
                        onChange={(e) => handleArrayChange('children', index, 'lastName', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <input 
                        type="date" value={child.dateOfBirth || ''} 
                        onChange={(e) => handleArrayChange('children', index, 'dateOfBirth', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Birth Certificate No.</label>
                      <input 
                        type="text" value={child.birthCertNo || ''} 
                        onChange={(e) => handleArrayChange('children', index, 'birthCertNo', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => addArrayItem('children', { firstName: '', lastName: '', dateOfBirth: '', birthCertNo: '' })}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                + Add Child
              </button>
            </div>
          )}

          {activeTab === 'parents' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Home size={16} className="text-blue-600" />
                  Parents / Guardians
                </h3>
                <div className="space-y-4">
                  {(formData.parentGuardians || []).map((pg: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input 
                          type="text" value={pg.firstName + ' ' + (pg.lastName || '')} 
                          onChange={(e) => {
                            const [f, ...l] = e.target.value.split(' ');
                            handleArrayChange('parentGuardians', index, 'firstName', f);
                            handleArrayChange('parentGuardians', index, 'lastName', l.join(' '));
                          }} 
                          className={inputClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Relationship</label>
                        <input 
                          type="text" value={pg.relationship || ''} 
                          onChange={(e) => handleArrayChange('parentGuardians', index, 'relationship', e.target.value)} 
                          className={inputClass} 
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addArrayItem('parentGuardians', { firstName: '', lastName: '', relationship: '' })}
                    className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                  >
                    + Add Parent/Guardian
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Heart size={16} className="text-pink-600" />
                  Parents-in-Law
                </h3>
                <div className="space-y-4">
                  {(formData.parentsInLaws || []).map((pil: any, index: number) => (
                    <div key={index} className="p-4 border border-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input 
                          type="text" value={pil.firstName + ' ' + (pil.lastName || '')} 
                          onChange={(e) => {
                            const [f, ...l] = e.target.value.split(' ');
                            handleArrayChange('parentsInLaws', index, 'firstName', f);
                            handleArrayChange('parentsInLaws', index, 'lastName', l.join(' '));
                          }} 
                          className={inputClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Relationship</label>
                        <input 
                          type="text" value={pil.relationship || ''} 
                          onChange={(e) => handleArrayChange('parentsInLaws', index, 'relationship', e.target.value)} 
                          className={inputClass} 
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addArrayItem('parentsInLaws', { firstName: '', lastName: '', relationship: '' })}
                    className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                  >
                    + Add Parent-in-Law
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
