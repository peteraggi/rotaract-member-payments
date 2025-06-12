'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center h-16 px-4 border-b border-gray-200 bg-white">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex justify-center">
        <img src="/rota.png" alt="Rotary" className="h-8" />
      </div>
    </header>
  );
}