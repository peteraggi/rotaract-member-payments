import { auth } from '@/auth';
import ReportsPage from '@/components/registration/Reports'
import React from 'react'

const page = async () => {
    const session = await auth();
  return (
    <div>
    <ReportsPage session={session} />
    </div>
  )
}

export default page