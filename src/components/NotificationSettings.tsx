'use client';

import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getUser } from '@/lib/auth-client';

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  contributionAlerts: boolean;
  welfareAlerts: boolean;
  systemAlerts: boolean;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    contributionAlerts: true,
    welfareAlerts: true,
    systemAlerts: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = getUser();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    if (!user?.member?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/members/${user.member.id}`);
      if (response.ok) {
        const member = await response.json();
        setPreferences({
          emailEnabled: member.notificationEmailEnabled ?? true,
          smsEnabled: member.notificationSmsEnabled ?? false,
          contributionAlerts: member.contributionAlerts ?? true,
          welfareAlerts: member.welfareAlerts ?? true,
          systemAlerts: member.systemAlerts ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.member?.id) {
      toast.error('No member found');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/members/${user.member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationEmailEnabled: preferences.emailEnabled,
          notificationSmsEnabled: preferences.smsEnabled,
          contributionAlerts: preferences.contributionAlerts,
          welfareAlerts: preferences.welfareAlerts,
          systemAlerts: preferences.systemAlerts,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Notification Channels</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how you want to receive notifications
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Email Notifications</h4>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(e) => setPreferences({ ...preferences, emailEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">SMS Notifications</h4>
                <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsEnabled}
                onChange={(e) => setPreferences({ ...preferences, smsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Notification Types</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select which types of notifications you want to receive
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
            <div>
              <h4 className="font-semibold text-foreground">Contribution Alerts</h4>
              <p className="text-xs text-muted-foreground">
                Get notified about your contribution payments
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.contributionAlerts}
                onChange={(e) =>
                  setPreferences({ ...preferences, contributionAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
            <div>
              <h4 className="font-semibold text-foreground">Welfare Alerts</h4>
              <p className="text-xs text-muted-foreground">
                Updates on your welfare cases and applications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.welfareAlerts}
                onChange={(e) =>
                  setPreferences({ ...preferences, welfareAlerts: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-border rounded-lg">
            <div>
              <h4 className="font-semibold text-foreground">System Alerts</h4>
              <p className="text-xs text-muted-foreground">
                Important system announcements and updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.systemAlerts}
                onChange={(e) => setPreferences({ ...preferences, systemAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
