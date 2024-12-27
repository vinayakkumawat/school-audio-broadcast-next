import React from 'react'
import { UserManagement } from '@/components/UserManagement';
import { Layout } from '@/components/Layout';

const UsersPage = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <UserManagement />
            </div>
        </Layout>
    )
}

export default UsersPage