import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Share, PlusSquare } from 'lucide-react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';

interface IOSInstallInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IOSInstallInstructions: React.FC<IOSInstallInstructionsProps> = ({ open, onOpenChange }) => {
  const { dismissInstall } = usePwaInstall();

  const handleDismiss = () => {
    dismissInstall();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center">Install FamousAI on iPhone or iPad</DrawerTitle>
            <DrawerDescription className="text-center">
              Add FamousAI to your device for faster access and an app-like mobile experience.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-4">
            <div className="flex items-center space-x-4 bg-stone-100 p-3 rounded-lg">
              <div className="bg-white p-2 rounded-md shadow-sm">
                <Share className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">1. Tap the Share button</p>
                <p className="text-xs text-stone-500">Located at the bottom or top of Safari</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-stone-100 p-3 rounded-lg">
              <div className="bg-white p-2 rounded-md shadow-sm">
                <PlusSquare className="h-5 w-5 text-stone-900" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">2. Select Add to Home Screen</p>
                <p className="text-xs text-stone-500">Scroll down to find this option</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-stone-100 p-3 rounded-lg">
              <div className="bg-white p-2 rounded-md shadow-sm font-serif font-bold text-lg px-3">
                R
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">3. Confirm and tap Add</p>
                <p className="text-xs text-stone-500">Keep the name as "FamousAI"</p>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="default">Got It</Button>
            </DrawerClose>
            <Button variant="ghost" onClick={handleDismiss}>Do Not Show Again</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
