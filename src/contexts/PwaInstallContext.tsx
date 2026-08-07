import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PwaInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  promptInstall: () => Promise<void>;
  updateApp: () => void;
  dismissInstall: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextType>({
  isInstallable: false,
  isInstalled: false,
  isStandalone: false,
  isIOS: false,
  isOffline: false,
  updateAvailable: false,
  promptInstall: async () => {},
  updateApp: () => {},
  dismissInstall: () => {},
});

export const usePwaInstall = () => useContext(PwaInstallContext);

export const PwaInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // virtual:pwa-register hook handles SW registration and update checks
  const {
    needRefresh: [updateAvailable],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered', r);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
    setIsInstalled(isStandaloneMode);

    // Handle offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle beforeinstallprompt (Android, Desktop Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only set installable if we haven't previously dismissed it today
      const dismissed = localStorage.getItem('famousai_pwa_dismissed');
      if (!dismissed) {
        setIsInstallable(true);
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, the UI should handle opening the instruction sheet since there's no native prompt
      setIsInstallable(true); 
    }
  }, [deferredPrompt, isIOS]);

  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
    // Hide for 24 hours
    localStorage.setItem('famousai_pwa_dismissed', Date.now().toString());
  }, []);

  const updateApp = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return (
    <PwaInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isStandalone,
        isIOS,
        isOffline,
        updateAvailable,
        promptInstall,
        updateApp,
        dismissInstall,
      }}
    >
      {children}
    </PwaInstallContext.Provider>
  );
};
