'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Users, Settings, LogOut, Calendar, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useState } from 'react'; // Added useState import
import { Loader2 } from 'lucide-react'; // Added Loader2 import

export function Sidebar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Added loading state

  const handleLogout = async () => {
    setIsLoggingOut(true); // Start loading
    try {
      // Clear client-side storage
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Sign out from NextAuth if using authentication
      await signOut({ redirect: false });
      
      // Redirect to login page
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-lg">
      {/* Responsive Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 
                      md:h-20 lg:h-24">
        <img 
          src="/rota.png" 
          alt="Rotary" 
          className="h-12 w-auto transition-all duration-300 hover:scale-105 
                    sm:h-14 md:h-16 lg:h-20"
        />
      </div>
      
      {/* User Profile */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Avatar className="h-10 w-10 md:h-12 md:w-12">
          <AvatarImage src="/profile.png" />
          <AvatarFallback>RU</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium md:text-base">Rotary User</p>
          <p className="text-xs text-gray-500 md:text-sm">Member</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/registration" className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-900 md:text-base">
          <User className="mr-3 h-5 w-5 md:h-6 md:w-6" />
          My Registration
        </Link>
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-white bg-gray-900 hover:bg-red-700 hover:text-white
                    transition-colors duration-200"
          disabled={isLoggingOut} // Disable button during logout
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              <span className="text-sm md:text-base">Signing Out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-5 w-5" />
              <span className="text-sm md:text-base">Sign Out</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}