import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { XCircleIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    setSettings(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Application Settings</h3>
           <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
             <XCircleIcon className="h-6 w-6"/>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="lateThreshold" className="block text-sm font-medium text-slate-700 mb-1">
              Late Check-in Threshold
            </label>
            <input
              type="time"
              id="lateThreshold"
              name="lateThreshold"
              value={localSettings.lateThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">Students checking in at or after this time are marked 'Late'.</p>
          </div>
          <div>
            <label htmlFor="lateCheckOutThreshold" className="block text-sm font-medium text-slate-700 mb-1">
              Late Check-out Threshold
            </label>
            <input
              type="time"
              id="lateCheckOutThreshold"
              name="lateCheckOutThreshold"
              value={localSettings.lateCheckOutThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
             <p className="text-xs text-slate-500 mt-1">Students checking out at or after this time are marked 'Late'.</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
