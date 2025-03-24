export const WS_URL = 'wss://api.sr.70-60.com';

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_AUDIO: 'new_audio',
  AUDIO_REMOVED: 'audio_removed',
  ERROR: 'error',
} as const;