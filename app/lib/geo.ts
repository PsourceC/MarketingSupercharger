export function getCityCoords(area: string): { lat: number; lng: number } | null {
  const key = area.trim().toLowerCase()
  const dict: Record<string, { lat: number; lng: number }> = {
    'austin, tx': { lat: 30.2672, lng: -97.7431 },
    'central austin': { lat: 30.2672, lng: -97.7431 },
    'round rock, tx': { lat: 30.5084, lng: -97.6789 },
    'cedar park, tx': { lat: 30.5052, lng: -97.8203 },
    'georgetown, tx': { lat: 30.6332, lng: -97.6779 },
    'pflugerville, tx': { lat: 30.4394, lng: -97.6200 },
    'leander, tx': { lat: 30.5788, lng: -97.8531 },
    'hutto, tx': { lat: 30.5427, lng: -97.5464 },
    'lakeway, tx': { lat: 30.3632, lng: -97.9961 },
    'san antonio, tx': { lat: 29.4241, lng: -98.4936 },
    'phoenix, az': { lat: 33.4484, lng: -112.0740 },
    'tucson, az': { lat: 32.2226, lng: -110.9747 },
    'mesa, az': { lat: 33.4152, lng: -111.8315 },
    'scottsdale, az': { lat: 33.4942, lng: -111.9261 },
    'tempe, az': { lat: 33.4255, lng: -111.9400 }
  }
  return dict[key] || null
}
