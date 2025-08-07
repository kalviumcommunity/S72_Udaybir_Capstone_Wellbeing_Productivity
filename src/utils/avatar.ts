export function getAvatarUrl(gender: string, mood: string) {
  let moodParam = 'neutral';
  if (mood === 'terrible' || mood === 'bad') moodParam = 'sad';
  else if (mood === 'good' || mood === 'excellent') moodParam = 'happy';
  return `https://api.dicebear.com/7.x/avataaars/svg?gender=${gender || 'neutral'}&mood[]=${moodParam}`;
} 