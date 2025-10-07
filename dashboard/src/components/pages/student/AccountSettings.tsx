import React, { useState } from 'react';
import StudentLayout from '../../layout/StudentLayout';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Settings, Lock, Bell, Eye, Trash2 } from 'lucide-react';

export default function AccountSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    recommendations: true,
    deadlines: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    shareData: true
  });

  return (
    <StudentLayout title="Account Settings">
      <div className="space-y-6">
        <div className="backdrop-blur-xl bg-gradient-to-r from-gray-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-700" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
              <p className="text-gray-600">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
            </div>
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <p className="text-sm text-gray-500">
                      {key === 'email' && 'Receive updates via email'}
                      {key === 'push' && 'Browser push notifications'}
                      {key === 'recommendations' && 'New program recommendations'}
                      {key === 'deadlines' && 'Application deadline reminders'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, [key]: checked})
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy
            </h3>
            <div className="space-y-4">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <p className="text-sm text-gray-500">
                      {key === 'profileVisible' && 'Make profile visible to universities'}
                      {key === 'shareData' && 'Allow anonymous data sharing for improvements'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, [key]: checked})
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-red-50/40 border-red-200/20 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}