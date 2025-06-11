

import Link from 'next/link';
import { fetchTransactions } from '@/lib/actions';
import type { Transaction } from '@/lib/types';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionCard from '@/components/transactions/TransactionCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react'; 
import AddTransactionDialog from '@/components/transactions/AddTransactionDialog';

export default async function TransactionsPage({ searchParams }: { searchParams?: { month?: string } }) {
  const selectedMonth = searchParams?.month;

  const allTransactions = await fetchTransactions();

  let displayTransactions = allTransactions;
  if (selectedMonth && selectedMonth !== "all-time") {
    displayTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
    });
  }
  
  displayTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-headline text-primary">Registro</h1>
        <div className="flex items-center gap-2">
          <AddTransactionDialog>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Transacción
            </Button>
          </AddTransactionDialog>
        </div>
      </div>
      
      {/* Mobile View: List of TransactionCards */}
      <div className="space-y-4 md:hidden">
        {displayTransactions.length > 0 ? (
          displayTransactions.map(transaction => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No hay transacciones para mostrar en el periodo seleccionado.
          </p>
        )}
      </div>

      {/* Desktop View: TransactionTable */}
      <div className="hidden md:block">
        <TransactionTable transactions={displayTransactions} />
      </div>
    </div>
  );
}
