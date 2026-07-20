export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const
export type SeasonName = (typeof SEASONS)[number]

/**
 * Meteorological season for the Northern Hemisphere (the business is in
 * Flushing, NY): spring = Mar–May, summer = Jun–Aug, fall = Sep–Nov,
 * winter = Dec–Feb. Drives only the background field, the hero bloom wash, and
 * the catalogue tile cast — the plum accent, ink, and cream sheets stay fixed.
 */
export function getSeason(date: Date = new Date()): SeasonName {
  const month = date.getMonth() // 0-based
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

function isSeason(value: string | null): value is SeasonName {
  return value !== null && (SEASONS as readonly string[]).includes(value)
}

/**
 * The season to render: `?season=spring|summer|fall|winter` wins when present
 * (lets the owner preview any season), otherwise it's derived from today's date.
 */
export function resolveSeason(): SeasonName {
  if (typeof window !== 'undefined') {
    const override = new URLSearchParams(window.location.search).get('season')
    if (isSeason(override)) return override
  }
  return getSeason()
}

/** Stamp the current season on <html data-season> so the CSS palette applies. */
export function applySeason(season: SeasonName = resolveSeason()): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.season = season
  }
}
