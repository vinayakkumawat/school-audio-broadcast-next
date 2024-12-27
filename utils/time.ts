export const calculateTimeLeft = (createdAt: string): number => {
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const timeLeft = Math.max(0, 10 * 60 * 1000 - (now - created));
  return Math.ceil(timeLeft / 1000 / 60);
};

export const formatTimeLeft = (minutes: number): string => {
  if (minutes <= 0) return 'Expired';
  return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
};