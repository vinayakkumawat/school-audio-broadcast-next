import { Audio } from '../types';

export const findNextAudioToPlay = (
  firstQueue: Audio[],
  secondQueue: Audio[],
  thirdQueue: Audio[]
): Audio | null => {
  if (firstQueue.length > 0) return firstQueue[0];
  if (secondQueue.length > 0) return secondQueue[0];
  if (thirdQueue.length > 0) return thirdQueue[0];
  return null;
};

export const getQueueName = (queueNumber: number): string => {
  switch (queueNumber) {
    case 1:
      return 'Priority Queue 1';
    case 2:
      return 'Priority Queue 2';
    case 3:
      return 'Priority Queue 3';
    default:
      return 'Unknown Queue';
  }
};