import { auth } from '@/auth';
import RegistrationForm from '@/components/registration/RegistrationForm';
import { redirect } from 'next/navigation';

export default async function RegistrationPage() {
  const session = await auth();

  if (!session) {
    redirect('/?callbackUrl=/registration');
  }

  return <RegistrationForm session={session} />;
}