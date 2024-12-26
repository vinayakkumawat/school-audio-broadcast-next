import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { Switch } from './Switch';

export const AdminSettings: React.FC = () => {
  const { isTestingEnabled, toggleTesting } = useSettingsStore();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Settings</h2>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Testing Page</h3>
          <p className="text-sm text-gray-500">
            Enable or disable access to the testing interface
          </p>
        </div>
        <Switch
          checked={isTestingEnabled}
          onChange={toggleTesting}
          label="Enable Testing Page"
        />
      </div>
    </div>
  );
};