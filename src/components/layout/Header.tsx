
'use client';

import Link from 'next/link';
import { PlusCircle, History, Settings, LineChart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddBetDialog from '@/components/bets/AddBetDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from 'next/navigation'; // useSearchParams ya no es necesario aquí
import { useState, useEffect } from 'react';

// HeaderProps eliminada o vacía si no hay otras props
interface HeaderProps {
  // availableMonths prop eliminada
}

export default function Header({/* availableMonths prop eliminada */}: HeaderProps) {
  const pathname = usePathname();
  // searchParams ya no es necesario aquí si el MonthSelector fue removido permanentemente
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const displayAddBetButton = isClient && pathname === '/';
  const displaySettingsDropdown = isClient && (pathname === '/' || pathname === '/performance' || pathname === '/transactions');
  
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-headline font-bold text-primary shrink-0">
          BetBalance
        </Link>
        
        <div className="flex items-center justify-end gap-2 flex-wrap ml-2">
          {displayAddBetButton && (
            <AddBetDialog>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Apuesta
              </Button>
            </AddBetDialog>
          )}

          {displaySettingsDropdown && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-8 sm:w-8">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configuración</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {pathname !== '/' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Panel Principal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {pathname !== '/performance' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/performance" className="flex items-center w-full">
                      <LineChart className="mr-2 h-4 w-4" />
                      <span>Rendimiento</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {pathname !== '/transactions' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/transactions" className="flex items-center w-full">
                      <History className="mr-2 h-4 w-4" />
                      <span>Registro</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
