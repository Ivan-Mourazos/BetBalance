'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-headline text-destructive mb-2">¡Ups! Algo salió mal.</h2>
      <p className="text-muted-foreground mb-6">
        Encontramos un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      {error?.message && <p className="text-sm text-muted-foreground mb-1">Error: {error.message}</p>}
      {error?.digest && <p className="text-xs text-muted-foreground/50 mb-6">Resumen: {error.digest}</p>}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="default"
      >
        Intentar de nuevo
      </Button>
    </div>
  );
}
