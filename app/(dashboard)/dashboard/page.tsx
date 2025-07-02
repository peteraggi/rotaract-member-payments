import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RegistrationForm from '@/components/registration/RegistrationForm';
import RegisteredView from '@/components/registration/RegisteredView';
import { prisma } from '@/lib/prisma';

export default async function RegistrationPage() {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/?callbackUrl=/dashboard');
  }

  // 2. Check registration status directly in database
  const registration = await prisma.registration.findFirst({
    where: {
      user: { email: session.user.email },
      registration_status: 'registered'
    },
    include: {
      user: true 
    }
  });

  // 3. Render the appropriate component
  return registration ? <RegisteredView /> : <RegistrationForm session={session} />;
}