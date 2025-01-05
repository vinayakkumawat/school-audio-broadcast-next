'use client'

import React from 'react';
import { LoginForm } from '@/components/LoginForm';
import AppDownload from '@/components/AppDownload';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
      <AppDownload />
    </div>
  );
}
