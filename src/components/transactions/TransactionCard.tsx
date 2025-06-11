
'use client';

import type { Transaction } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isDebit = transaction.type === 'Depósito' || transaction.type === 'Compra de Picks';

  return (
    <Card className="shadow-md w-full">
      <CardContent className="flex justify-between items-center p-4">
        <div className="space-y-0.5 flex-grow mr-3">
          <p className="text-sm font-medium text-foreground leading-tight break-words">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(transaction.date), 'PPP', { locale: es })}
          </p>
        </div>
        <div className="text-right space-y-1 shrink-0">
          <p
            className={cn(
              "text-lg font-semibold",
              isDebit ? 'text-destructive' : 'text-success'
            )}
          >
            {isDebit ? '-' : '+'}€{transaction.amount.toFixed(2)}
          </p>
          <Badge
            variant={'outline'}
            className={cn(
              "text-xs py-0.5 px-1.5 h-auto font-normal float-right", 
              isDebit
                ? 'bg-destructive/20 text-destructive border-destructive/30'
                : 'bg-success/20 text-success border-success/30'
            )}
          >
            {transaction.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
