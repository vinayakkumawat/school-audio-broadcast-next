'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { SmartphoneIcon as Android, Apple } from 'lucide-react'

export default function AppDownload() {
  return (
    <div className='fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg'>
      <h2 className="text-xl font-bold mb-4 text-center">Download Audio Recorder Mobile App</h2>
      <div className="flex justify-center space-x-4">
        <Link href="/audio-recorder-android.apk" download>
          <Button variant="secondary" className='border hover:bg-gray-700'>
            <Android className="mr-2 h-4 w-4" />
            Download for Android
          </Button>
        </Link>
        {/* <Link href="/audio-recorder-ios.ipa" download>
          <Button variant="secondary">
            <Apple className="mr-2 h-4 w-4" />
            Download for iOS
          </Button>
        </Link> */}
      </div>
    </div>
  )
}

