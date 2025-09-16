import { apiGet, apiPost, apiGetPredictHQ } from './apiClient'

export interface EventItem {
  distance: number
  popularity: number
  id: string
  title: string
  description: string
  date: Date
  location: string
  price?: string
  latitude?: string
  longitude?: string
  category?: { type: string }[]
  images?: { url: string }[]
  rank?: number
  source?: 'ticketmaster' | 'predicthq'
}

export const apiService = {
  // --- Existing Ticketmaster Events ---
  async getEvents(page = 0, size = 20, countryCode = 'US'): Promise<EventItem[]> {
    const data = await apiGet<{ _embedded?: { events: any[] } }>(
      '/events.json',
      { page, size, countryCode }
    )

    const events = data._embedded?.events || []
    return this.formatEventsData(events)
  },

  // --- Event details ---
  async getEventDetails(id: string) {
    return await apiGet(`/${id}.json`)
  },

  async sendFeedback(feedback: { name: string; message: string }) {
    return await apiPost('/feedback', feedback)
  },

  // --- Search ---
  async searchEventsByKeyword(keyword: string, page = 0, size = 20) {
    if (!keyword) return []

    const tmData = await apiGet<{ _embedded?: { events: any[] } }>(
      '/events.json',
      { keyword, page, size }
    )

    const events = tmData._embedded?.events || []
    return this.formatEventsData(events)
  },

  // --- Combined Events: Ticketmaster + PredictHQ ---
  async getCombinedEvents(keyword = '', page = 0, size = 20): Promise<EventItem[]> {
    // --- Ticketmaster ---
    const tmData = await apiGet<{ _embedded?: { events: any[] } }>(
      '/events.json',
      { keyword, page, size }
    )
    const tmEvents = this.formatEventsData(tmData._embedded?.events || [])

    // --- PredictHQ ---
    const phqData = await apiGetPredictHQ<{ results: any[] }>(
      '/events/',
      { q: keyword, limit: size }
    )
    const phqEvents = this.formatPredictHQData(phqData.results || [])

    // --- Merge & sort by date ---
    return [...tmEvents, ...phqEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  },

  formatEventsData(events: any[]): EventItem[] {
    console.log('ticketmaster events: ',events[0]);
    return events.map(event => ({
      id: event.id,
      title: event.name,
      description: event.info || '',
      date: event.dates?.start?.localDate,
      location: event._embedded?.venues?.[0]?.name || 'Unknown',
      latitude: event._embedded?.venues?.[0]?.location?.latitude,
      longitude: event._embedded?.venues?.[0]?.location?.longitude,
      price: event.priceRanges?.[0]
        ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
        : undefined,
      category: event.classifications,
      images: event.images || [],
      popularity: event?.popularity || 0,
      rank: event?.rank || 0,
      distance: event?.distance || 0,
      source: 'ticketmaster'
    }))
  },

  formatPredictHQData(events: any[]): EventItem[] {
    console.log('formatPredictHQData events: ',events[0]);
    return events.map(event => ({
      id: `phq_${event.id}`,
      title: event.title,
      description: event.description || '',
      date: event.start.split('T')[0],
      location: event.entities?.[0]?.name || 'Unknown',
      latitude: event.location?.[1]?.toString(),
      longitude: event.location?.[0]?.toString(),
      price: event?.price || 0,
      category: [],
      images: event?.images,
      popularity: event?.popularity || 0,
      rank: event.rank,
      distance: event?.distance || 0,
      source: 'predicthq'
    }))
  }
}
