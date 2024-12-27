'use client'

import React from 'react'
import { useSettingsStore } from '@/store/useSettingsStore';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { WebSocketStatus } from '@/components/WebSocketStatus';
import { v4 as uuidv4 } from 'uuid';

const TestingPage = () => {
    const { isTestingEnabled } = useSettingsStore();
    const anonymousId = React.useMemo(() => uuidv4(), []);

    if (!isTestingEnabled) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Testing Page Disabled</h2>
                    <p className="mt-2 text-gray-600">
                        The testing interface is currently disabled by the administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow p-6 space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audio Testing Interface</h1>
                    <p className="mt-2 text-gray-600">
                        Use this interface to test audio recording and playback functionality.
                    </p>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-lg font-medium mb-4">Voice Recording</h2>
                        <VoiceRecorder userId={anonymousId} />
                    </section>

                    <section>
                        <h2 className="text-lg font-medium mb-4">Connection Status</h2>
                        <WebSocketStatus />
                    </section>
                </div>
            </div>
        </div>
    )
}

export default TestingPage