import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppSettings {
  lateThreshold: string; // Time format HH:MM
  lateCheckOutThreshold: string; // Time format HH:MM
}

interface SettingsContextType {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const defaultSettings: AppSettings = {
  lateThreshold: '09:00',
  lateCheckOutThreshold: '16:00', // 4:00 PM
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
