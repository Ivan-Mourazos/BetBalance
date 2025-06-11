
'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cashOutBet } from '@/lib/actions';
import type { Bet, CashOutFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { HandCoins } from 'lucide-react';

const cashOutFormSchema = z.object({
  cashOutAmount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'El importe debe ser un número igual o mayor a cero.',
  }),
});

type CashOutFormValues = z.infer<typeof cashOutFormSchema>;

interface CashOutBetDialogProps {
  bet: Bet;
  children: React.ReactNode; // Trigger element
}

export default function CashOutBetDialog({ bet, children }: CashOutBetDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CashOutFormValues>({
    resolver: zodResolver(cashOutFormSchema),
    defaultValues: {
      cashOutAmount: '',
    },
  });

  async function onSubmit(data: CashOutFormValues) {
    setIsSubmitting(true);
    const result = await cashOutBet(bet.id, data.cashOutAmount);

    if (result.error) {
      toast({ title: 'Error en Cash Out', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Cash Out Exitoso', description: result.success });
      form.reset();
      setOpen(false);
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <HandCoins className="h-5 w-5 mr-2 text-primary" />
            Cerrar Apuesta (Cash Out)
          </DialogTitle>
          <DialogDescription>
            Introduce el importe por el cual quieres cerrar esta apuesta: <span className="font-semibold">{bet.title}</span>.
            <br />
            Apostado: €{bet.stake.toFixed(2)} | Ganancia Posible: €{bet.potentialWinnings.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cashOutAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importe de Cierre (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 8.50" {...field} step="0.01" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Cerrando...' : 'Confirmar Cash Out'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
