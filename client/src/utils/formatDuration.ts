export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]?.slice(0, -1) || '0');
  const minutes = parseInt(match[2]?.slice(0, -1) || '0');
  const seconds = parseInt(match[3]?.slice(0, -1) || '0');

  return hours * 3600 + minutes * 60 + seconds;
} 