import React from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Play, Trash2, Clock } from 'lucide-react';
import { isAudioExpired } from '../utils/audioQueue';
import { calculateTimeLeft, formatTimeLeft } from '../utils/time';
import { getQueueName } from '../utils/queueHelpers';

export const QueueList: React.FC = () => {
  const { firstQueue, secondQueue, thirdQueue, removeAudio } = useAudioStore();

  const renderQueue = (queue: any[], queueNumber: number) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{getQueueName(queueNumber)}</h2>
      {queue.length === 0 ? (
        <p className="text-gray-500">No audio files in queue</p>
      ) : (
        <div className="space-y-2">
          {queue.map((audio) => {
            const timeLeft = calculateTimeLeft(audio.createdAt);
            const expired = isAudioExpired(audio);

            return (
              <div
                key={audio.id}
                className={`flex items-center justify-between bg-white p-4 rounded-lg shadow ${
                  expired ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Play className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Audio {audio.id}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className={expired ? 'text-red-500' : ''}>
                        {formatTimeLeft(timeLeft)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAudio(audio.id)}
                  className="p-2 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {renderQueue(firstQueue, 1)}
      {renderQueue(secondQueue, 2)}
      {renderQueue(thirdQueue, 3)}
    </div>
  );
};