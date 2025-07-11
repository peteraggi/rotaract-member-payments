// import { auth } from '@/auth';
// import { redirect } from 'next/navigation';
// import RegistrationForm from '@/components/registration/RegistrationForm';
// import RegisteredView from '@/components/registration/RegisteredView';
// import { prisma } from '@/lib/prisma';

// export default async function RegistrationPage() {
//   // 1. Check authentication
//   const session = await auth();
//   if (!session?.user?.email) {
//     redirect('/?callbackUrl=/registration');
//   }

//   // 2. Check registration status directly in database
//   const registration = await prisma.registration.findFirst({
//     where: {
//       user: { email: session.user.email },
//       registration_status: 'registered'
//     },
//     include: {
//       user: true 
//     }
//   });

//   // 3. Render the appropriate component
//   return registration ? <RegisteredView /> : <RegistrationForm session={session} />;
// }

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RegistrationForm from '@/components/registration/RegistrationForm';
import RegisteredView from '@/components/registration/RegisteredView';
import { prisma } from '@/lib/prisma';
export default async function RegistrationPage() {
  const session = await auth();
  
  // If no session, redirect to login
  if (!session?.user) {
    redirect('/?callbackUrl=/registration');
  }

  // If admin somehow reaches this page, redirect to admin
  if (session.user.isAdmin) {
    redirect('/admin');
  }

  // Check registration status for regular users
  const registration = await prisma.registration.findFirst({
    where: {
      user: { email: session.user.email! },
      registration_status: 'registered'
    },
    include: {
      user: true 
    }
  });

  return registration ? <RegisteredView /> : <RegistrationForm session={session} />;
}