
'use client';

import type { Bet } from '@/lib/types';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteBet, voidBet as voidBetAction, resolveBet as resolveBetAction, reopenBet as reopenBetAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Edit3, Trash2, CheckCircle2, XCircle, HelpCircle, CalendarClock, Ban, RotateCcw, HandCoins, ArchiveRestore } from 'lucide-react';
import EditBetDialog from './EditBetDialog';
import CashOutBetDialog from './CashOutBetDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BetCardProps {
  bet: Bet;
}

const getStatusIcon = (status: Bet['status']) => {
  switch (status) {
    case 'Pending':
      return <CalendarClock className="h-3 w-3" />;
    case 'Won':
      return <CheckCircle2 className="h-3 w-3" />;
    case 'Lost':
      return <XCircle className="h-3 w-3" />;
    case 'Void':
      return <Ban className="h-3 w-3" />;
    case 'CashedOut':
      return <ArchiveRestore className="h-3 w-3" />;
    default:
      return <HelpCircle className="h-3 w-3" />;
  }
}

const translateStatus = (status: Bet['status']): string => {
  switch (status) {
    case 'Pending': return 'Pendiente';
    case 'Won': return 'Ganada';
    case 'Lost': return 'Perdida';
    case 'Void': return 'Anulada';
    case 'CashedOut': return 'Cerrada';
    default: return status;
  }
};

export default function BetCard({ bet }: BetCardProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formattedCreatedAt, setFormattedCreatedAt] = useState<string>('...');

  useEffect(() => {
    if (bet.createdAt) {
      try {
        setFormattedCreatedAt(format(new Date(bet.createdAt), "d MMM yy, HH:mm", { locale: es }));
      } catch (e) {
        console.error("Error formatting creation date:", e);
        setFormattedCreatedAt("Fecha inválida");
      }
    }
  }, [bet.createdAt]);

  const handleDelete = async () => {
    setIsSubmitting(true);
    const result = await deleteBet(bet.id);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: result.success });
    }
    setIsSubmitting(false);
  };

  const handleVoidBet = async () => {
    setIsSubmitting(true);
    const result = await voidBetAction(bet.id);
    if (result.error) {
      toast({ title: 'Error al anular', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Apuesta Anulada', description: result.success });
    }
    setIsSubmitting(false);
  };

  const handleResolveBet = async (status: 'Won' | 'Lost') => {
    setIsSubmitting(true);
    const result = await resolveBetAction(bet.id, status);
    if (result.error) {
      toast({ title: 'Error al resolver', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Apuesta Resuelta', description: result.success });
    }
    setIsSubmitting(false);
  };

  const handleReopenBet = async () => {
    setIsSubmitting(true);
    const result = await reopenBetAction(bet.id);
    if (result.error) {
      toast({ title: 'Error al Reabrir', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Apuesta Reabierta', description: result.success });
    }
    setIsSubmitting(false);
  };
  
  const cashOutNet = typeof bet.actualWinnings === 'number' ? bet.actualWinnings - bet.stake : 0;

  return (
    <Card className="shadow-lg w-full overflow-hidden p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
        <div className="flex-grow space-y-1">
          {/* Title and Odds section for all screens */}
          <div className="flex items-baseline gap-x-2">
            <CardTitle className="text-lg font-headline leading-tight min-w-0">
              {bet.title}
            </CardTitle>
            {/* Mobile Odds (visible on xs, hidden on sm and up) */}
            <p className="font-semibold text-foreground shrink-0 sm:hidden">@{bet.odds.toFixed(2)}</p>
            {/* Desktop Odds (hidden on xs, visible on sm and up) */}
            <p className="text-muted-foreground font-semibold shrink-0 hidden sm:block">@{bet.odds.toFixed(2)}</p>
          </div>

          {/* All Info (Date, Stake, Winnings), Mobile Status Badge */}
          <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2">
              {/* COMMON INFO for all screens starts here */}
              <span>{formattedCreatedAt}</span>
              <span className="hidden xxs:inline mx-1">|</span>
              <span className="italic">{bet.category}</span>
              {bet.status === 'Pending' && (
                <>
                  <span className="hidden xxs:inline mx-1">|</span>
                  <span>Apostado: <span className="font-semibold text-foreground">€{bet.stake.toFixed(2)}</span></span>
                  <span className="hidden xxs:inline mx-1">|</span>
                  <span>Posible: <span className="font-semibold text-primary">€{bet.potentialWinnings.toFixed(2)}</span></span>
                </>
              )}
              {bet.status !== 'Pending' && (
                <>
                  <span className="hidden xxs:inline mx-1">|</span>
                  <span>Apostado: <span className="font-semibold text-foreground">€{bet.stake.toFixed(2)}</span></span>
                  <span className="hidden xxs:inline mx-1">|</span>
                  {bet.status === 'Won' && typeof bet.actualWinnings === 'number' && (
                    <span>Ganado: <span className="font-semibold text-success">€{bet.actualWinnings.toFixed(2)}</span></span>
                  )}
                  {bet.status === 'Lost' && ( 
                    <span>Resultado: <span className="font-semibold text-destructive">-€{bet.stake.toFixed(2)}</span></span>
                  )}
                  {bet.status === 'Void' && typeof bet.actualWinnings === 'number' && (
                    <span>Devuelto: <span className="font-semibold text-foreground/80">€{bet.actualWinnings.toFixed(2)}</span></span>
                  )}
                  {bet.status === 'CashedOut' && typeof bet.actualWinnings === 'number' && (
                    <span className="flex items-baseline">
                      Cerrada por: 
                      <span className={cn(
                          "font-semibold ml-1",
                          cashOutNet > 0 ? 'text-success' : 
                          cashOutNet < 0 ? 'text-destructive' : 
                          'text-foreground/80'
                        )}>
                        €{bet.actualWinnings.toFixed(2)}
                      </span>
                      <span className={cn("text-xs ml-1", cashOutNet > 0 ? 'text-success' : cashOutNet < 0 ? 'text-destructive' : 'text-foreground/80')}>
                        ({cashOutNet >= 0 ? '+' : ''}€{cashOutNet.toFixed(2)})
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>
            {/* MOBILE Status Badge */}
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 h-6 shrink-0 sm:hidden", // Mobile only
                "bg-transparent border-transparent", 
                bet.status === 'Pending' && 'text-primary',
                (bet.status === 'Won' || (bet.status === 'CashedOut' && cashOutNet > 0)) && 'text-success',
                (bet.status === 'Lost' || (bet.status === 'CashedOut' && cashOutNet < 0)) && 'text-destructive',
                (bet.status === 'Void' || (bet.status === 'CashedOut' && cashOutNet === 0)) && 'text-foreground/80'
              )}
            >
              {getStatusIcon(bet.status)}
              {translateStatus(bet.status)}
            </Badge>
          </div>
        </div>

        {/* Right Column (Desktop Status Badge + Desktop Action Buttons on sm+) */}
        <div className="hidden sm:flex sm:flex-col items-end shrink-0 sm:w-auto">
          <Badge /* DESKTOP Status Badge */
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 h-6 shrink-0 mb-2", 
              "bg-transparent border-transparent", 
              bet.status === 'Pending' && 'text-primary',
              (bet.status === 'Won' || (bet.status === 'CashedOut' && cashOutNet > 0)) && 'text-success',
              (bet.status === 'Lost' || (bet.status === 'CashedOut' && cashOutNet < 0)) && 'text-destructive',
              (bet.status === 'Void' || (bet.status === 'CashedOut' && cashOutNet === 0)) && 'text-foreground/80'
            )}
          >
            {getStatusIcon(bet.status)}
            {translateStatus(bet.status)}
          </Badge>
           {/* Desktop Action Buttons */}
           {bet.status === 'Pending' && (
            <div className="flex flex-row flex-wrap justify-end gap-1.5">
              <Button variant="outline" size="sm" onClick={() => handleResolveBet('Won')} disabled={isSubmitting} className="text-success border-success hover:bg-success/10 hover:text-success sm:h-8 sm:w-8 sm:p-0 lg:h-9 lg:w-auto lg:px-3">
                <CheckCircle2 /> <span className="ml-2 sm:hidden lg:inline">Ganada</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleResolveBet('Lost')} disabled={isSubmitting} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8 sm:p-0 lg:h-9 lg:w-auto lg:px-3">
                <XCircle /> <span className="ml-2 sm:hidden lg:inline">Perdida</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 sm:h-8 sm:w-8 sm:p-0 lg:h-9 lg:w-auto lg:px-3" disabled={isSubmitting}>
                    <RotateCcw /> <span className="ml-2 sm:hidden lg:inline">Anular</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Anular Apuesta</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de que quieres anular esta apuesta? El importe apostado (€{bet.stake.toFixed(2)}) será devuelto.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleVoidBet} className="bg-amber-500 hover:bg-amber-500/90 text-white">Confirmar Anulación</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
              <CashOutBetDialog bet={bet}>
                <Button variant="outline" size="sm" className="border-sky-500 text-sky-500 hover:bg-sky-500/10 hover:text-sky-600 sm:h-8 sm:w-8 sm:p-0 lg:h-9 lg:w-auto lg:px-3" disabled={isSubmitting}>
                  <HandCoins /> <span className="ml-2 sm:hidden lg:inline">Cash Out</span>
                </Button>
              </CashOutBetDialog>
              <EditBetDialog bet={bet}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isSubmitting}>
                  <Edit3 className="h-4 w-4" /> <span className="sr-only">Editar Apuesta</span>
                </Button>
              </EditBetDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0" disabled={isSubmitting}>
                    <Trash2 className="h-4 w-4" /> <span className="sr-only">Eliminar Apuesta</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente esta apuesta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {bet.status !== 'Pending' && (
            <div className="flex flex-row flex-wrap justify-end gap-1.5">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 sm:h-8 sm:w-8 sm:p-0 lg:h-9 lg:w-auto lg:px-3" disabled={isSubmitting}>
                    <ArchiveRestore /> <span className="ml-2 sm:hidden lg:inline">Reabrir Apuesta</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Reabrir Apuesta?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de que quieres marcar esta apuesta como 'Pendiente' nuevamente? Se eliminará su estado de resolución y ganancias/pérdidas asociadas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleReopenBet} className="bg-blue-500 hover:bg-blue-500/90 text-white">Sí, Reabrir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0" disabled={isSubmitting}>
                    <Trash2 className="h-4 w-4" /> <span className="sr-only">Eliminar Apuesta</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente esta apuesta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons (Icon AND Text, Stacked, Full-width) */}
      {bet.status === 'Pending' && (
        <div className="flex flex-col gap-2 w-full mt-3 sm:hidden">
          <Button onClick={() => handleResolveBet('Won')} disabled={isSubmitting} variant="outline" size="sm" className="text-success border-success hover:bg-success/10 hover:text-success justify-start w-full">
            <CheckCircle2 className="h-4 w-4" /> <span className="ml-2">Ganada</span>
          </Button>
          <Button onClick={() => handleResolveBet('Lost')} disabled={isSubmitting} variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive justify-start w-full">
            <XCircle className="h-4 w-4" /> <span className="ml-2">Perdida</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 justify-start w-full" disabled={isSubmitting}>
                <RotateCcw className="h-4 w-4" /> <span className="ml-2">Anular</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Anular Apuesta</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de que quieres anular esta apuesta? El importe apostado (€{bet.stake.toFixed(2)}) será devuelto.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleVoidBet} className="bg-amber-500 hover:bg-amber-500/90 text-white">Confirmar Anulación</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
          <CashOutBetDialog bet={bet}>
            <Button variant="outline" size="sm" className="border-sky-500 text-sky-500 hover:bg-sky-500/10 hover:text-sky-600 justify-start w-full" disabled={isSubmitting}>
              <HandCoins className="h-4 w-4" /> <span className="ml-2">Cash Out</span>
            </Button>
          </CashOutBetDialog>
          <EditBetDialog bet={bet}>
            <Button variant="ghost" size="sm" className="justify-start w-full" disabled={isSubmitting}>
              <Edit3 className="h-4 w-4" /> <span className="ml-2">Editar Apuesta</span>
            </Button>
          </EditBetDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 justify-start w-full" disabled={isSubmitting}>
                <Trash2 className="h-4 w-4" /> <span className="ml-2">Eliminar Apuesta</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente esta apuesta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {bet.status !== 'Pending' && (
         <div className="flex flex-col gap-2 w-full mt-3 sm:hidden">
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 justify-start w-full" disabled={isSubmitting}>
                    <ArchiveRestore className="h-4 w-4" /> <span className="ml-2">Reabrir Apuesta</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Reabrir Apuesta?</AlertDialogTitle><AlertDialogDescription>¿Estás seguro de que quieres marcar esta apuesta como 'Pendiente' nuevamente? Se eliminará su estado de resolución y ganancias/pérdidas asociadas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleReopenBet} className="bg-blue-500 hover:bg-blue-500/90 text-white">Sí, Reabrir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 justify-start w-full" disabled={isSubmitting}>
                <Trash2 className="h-4 w-4" /> <span className="ml-2">Eliminar Apuesta</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente esta apuesta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
}
