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
import type { Bet } from '@/lib/types';

interface EditBetDialogProps {
  bet: Bet;
  children: React.ReactNode; // Trigger element
}

export default function EditBetDialog({ bet, children }: EditBetDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Apuesta</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de tu apuesta. Solo se pueden editar las apuestas pendientes.
          </DialogDescription>
        </DialogHeader>
        <BetForm bet={bet} onFormSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
