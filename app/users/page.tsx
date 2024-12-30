import React from 'react'
import { UserManagement } from '@/components/UserManagement';
import { Layout } from '@/components/Layout';

const UsersPage = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <UserManagement />
            </div>
        </Layout>
    )
}

export default UsersPage