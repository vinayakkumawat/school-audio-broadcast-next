import React from 'react';
import { QueueList } from '@/components/QueueList';
import { Layout } from '@/components/Layout';

const DashboardPage = () => {
    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Audio Queue Dashboard</h1>
                <QueueList />
            </div>
        </Layout>
    )
}

export default DashboardPage