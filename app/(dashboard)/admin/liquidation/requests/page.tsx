import { auth } from '@/auth';
import LiquidationRequestsForm from '@/components/admin/LiquidationRequestsForm'
import React from 'react'

const LiquidationRequestsPage = async () => {
    const session = await auth();
    const isAdmin = !!session?.user?.isAdmin;
    const isRequester = session?.user?.adminRole === 'requester';
    const isApprover = session?.user?.adminRole === 'approver';
    return (
        <div>
            <LiquidationRequestsForm
                session={session}
                isAdmin={isAdmin}
                isRequester={isRequester}
                isApprover={isApprover} />
        </div>
    )
}

export default LiquidationRequestsPage