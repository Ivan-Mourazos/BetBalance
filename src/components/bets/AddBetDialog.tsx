'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BetForm from './BetForm';

interface AddBetDialogProps {
  children: React.ReactNode; // Trigger element
}

export default function AddBetDialog({ children }: AddBetDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Añadir Nueva Apuesta</DialogTitle>
          <DialogDescription>
            Completa los detalles de tu nueva apuesta deportiva.
          </DialogDescription>
        </DialogHeader>
        <BetForm onFormSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
