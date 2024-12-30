import React, { useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';

// interface AudioDevice {
//   deviceId: string;
//   label: string;
//   kind: string;
//   groupId: string;
// }

interface AudioDeviceSelectorProps {
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
}

const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({ 
  selectedDevice, 
  onDeviceChange 
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getAudioDevices = async (): Promise<void> => {
      try {
        // Request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get the list of audio output devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = devices.filter(
          (device): device is MediaDeviceInfo => device.kind === 'audiooutput'
        );
        
        setDevices(audioOutputDevices);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to get audio devices. Please check browser permissions.');
        setLoading(false);
      }
    };

    getAudioDevices();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading audio devices...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <Select
      value={selectedDevice}
      onValueChange={onDeviceChange}
      className="w-full max-w-xs"
    >
      {devices.map((device) => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `Speaker ${device.deviceId.slice(0, 4)}`}
        </option>
      ))}
    </Select>
  );
};

export default AudioDeviceSelector;