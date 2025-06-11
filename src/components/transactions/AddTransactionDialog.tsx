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
import TransactionForm from './TransactionForm';

interface AddTransactionDialogProps {
  children: React.ReactNode; // Trigger element
}

export default function AddTransactionDialog({ children }: AddTransactionDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Añadir Transacción</DialogTitle>
          <DialogDescription>
            Registra un nuevo depósito o retiro.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm onFormSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
