import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { start_at: string; employee_id: string } | null;
}

export function NewAppointmentModal({ isOpen, onClose, initialData }: NewAppointmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          {/* Empty shell for New Appointment form */}
          {initialData?.start_at && (
            <p>Selected date: {new Date(initialData.start_at).toLocaleString()}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
