
'use client';

import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="my-8 text-center">
        <p className="text-muted-foreground">No hay transacciones para mostrar en el periodo seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const isDebit = transaction.type === 'Depósito' || transaction.type === 'Compra de Picks';
            return (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'PPP', { locale: es })}</TableCell>
                <TableCell>
                  <Badge 
                    variant={'outline'}
                    className={cn(
                      "hover:bg-opacity-30",
                      isDebit 
                      ? 'bg-destructive/20 text-destructive border-destructive/30' 
                      : 'bg-success/20 text-success border-success/30'
                    )}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
                <TableCell 
                  className={cn(
                    "text-right font-semibold",
                    isDebit ? 'text-destructive' : 'text-success'
                  )}
                >
                  {isDebit ? '-' : '+'}€{transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
         {transactions.length > 5 && (
            <TableCaption>Fin del listado de transacciones para el periodo seleccionado.</TableCaption>
        )}
      </Table>
    </div>
  );
}
