import Link from 'next/link';
import { Home, Users, Settings, LogOut, Calendar, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <img src="/rota.png" alt="Rotary" className="h-10" />
      </div>
      
      {/* User Profile */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/profile.png" />
          <AvatarFallback>RU</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium">Rotary User</p>
          <p className="text-xs text-gray-500">Member</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/registration" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-900">
          <User className="mr-3 h-5 w-5 text-gray-500" />
          My Registration
        </Link>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start text-gray-600">
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}