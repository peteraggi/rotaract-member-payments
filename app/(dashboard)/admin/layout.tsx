import { auth } from "@/auth";
import { MobileHeader } from "@/components/admin/mobile-header";
import { Sidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  const isAdmin = !!session?.user?.isAdmin;
  const isRequester = session?.user?.adminRole === 'requester';
  const isApprover = session?.user?.adminRole === 'approver';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader 
        session={session} 
        isAdmin={isAdmin}
        isRequester={isRequester}
        isApprover={isApprover}
      />

      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar 
          session={session} 
          isAdmin={isAdmin}
          isRequester={isRequester}
          isApprover={isApprover}
        />
      </div>
      
      {/* Main Content */}
      <div className="md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}