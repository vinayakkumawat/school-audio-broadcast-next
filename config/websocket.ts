export const WS_URL = 'wss://school.ml1010.com:3001';

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_AUDIO: 'new_audio',
  AUDIO_REMOVED: 'audio_removed',
  ERROR: 'error',
} as const;