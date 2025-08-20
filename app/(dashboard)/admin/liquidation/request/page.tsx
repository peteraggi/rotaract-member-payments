
import { auth } from '@/auth';
import LiquidationRequestForm from '@/components/admin/LiquidationRequestForm'
import React from 'react'

const RequestPage = async () => {
    const session = await auth();
    if (session?.user?.adminRole == 'requester') {
        return (
            <div>
                <LiquidationRequestForm session={session} />
            </div>
        )
    }
}

export default RequestPage