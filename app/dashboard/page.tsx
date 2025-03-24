'use client'

import React from 'react';
import { Layout } from '@/components/Layout';

import { AudioPlayer } from '@/components/AudioPlayer';

export default function DashboardPage() {
  return (
    <Layout>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Audio Dashboard</h1>
      <AudioPlayer />
    </div>
    </Layout>
  );
}