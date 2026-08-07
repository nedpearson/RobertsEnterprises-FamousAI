import React, { useState } from 'react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { IOSInstallInstructions } from './IOSInstallInstructions';

interface InstallFamousAIButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
}

export const InstallFamousAIButton: React.FC<InstallFamousAIButtonProps> = ({ 
  className,
  variant = "default",
  size = "default",
  fullWidth = false
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS && !isInstalled) {
      setShowIOSInstructions(true);
    } else {
      await promptInstall();
    }
  };

  if (isInstalled) {
    return (
      <Button 
        variant="secondary" 
        size={size} 
        disabled 
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <Check className="mr-2 h-4 w-4" />
        RobertsEnterprises Mobile is Installed
      </Button>
    );
  }

  if (!isInstallable && !isIOS) {
    // Unsupported browser or already installed and standalone check hasn't caught it yet
    return null;
  }

  return (
    <>
      <Button 
        onClick={handleInstallClick} 
        variant={variant} 
        size={size}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        <Download className="mr-2 h-4 w-4" />
        Install RobertsEnterprises Mobile
      </Button>
      
      <IOSInstallInstructions 
        open={showIOSInstructions} 
        onOpenChange={setShowIOSInstructions} 
      />
    </>
  );
};
