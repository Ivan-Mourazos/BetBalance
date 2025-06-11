'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorTransactions({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-headline text-destructive mb-2">Error al cargar transacciones</h2>
      <p className="text-muted-foreground mb-6">
        No pudimos cargar el registro de movimientos. Por favor, inténtalo de nuevo.
      </p>
      {error?.message && <p className="text-sm text-muted-foreground mb-1">Detalle: {error.message}</p>}
      <Button
        onClick={() => reset()}
        variant="default"
      >
        Reintentar
      </Button>
    </div>
  );
}
