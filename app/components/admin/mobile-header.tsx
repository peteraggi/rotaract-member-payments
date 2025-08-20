'use client';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import Image from 'next/image';

export function MobileHeader({ 
  session, 
  isAdmin,
  isRequester,
  isApprover
}: {
  session: any;
  isAdmin: boolean;
  isRequester: boolean;
  isApprover: boolean;
}) {
  return (
    <header className="md:hidden flex items-center h-20 px-6 border-b-2 border-gray-200 bg-white">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden p-3"
          >
            <Menu className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="p-0 w-72"
        >
          <Sidebar 
            session={session} 
            isAdmin={isAdmin}
            isRequester={isRequester}
            isApprover={isApprover}
          />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex justify-center">
        <Image 
          src="/logo.png" 
          alt="Rotary" 
          width={160} 
          height={80}
          className="object-contain"
        />
      </div>
    </header>
  );
}