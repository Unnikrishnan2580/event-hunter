import { LocationService } from '../locationService'
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
    return [...await tmEvents, ...await phqEvents]
  },
  
  async formatEventsData(events: any[]): Promise<EventItem[]> {
    // Fixed reference point (e.g., user's location)

    return Promise.all(
      events.map(async (event) => {
        // Extract event latitude & longitude safely
        const eventLat = parseFloat(event._embedded?.venues?.[0]?.location?.latitude ?? '0');
        const eventLng = parseFloat(event._embedded?.venues?.[0]?.location?.longitude ?? '0');

        // Calculate distance for this event
        const distanceKm =
          (await LocationService.getDistanceKm( eventLat, eventLng)) || 0;

        return {
          id: event.id,
          title: event.name,
          description: event.info || '',
          date: event.dates?.start?.localDate,
          location: event._embedded?.venues?.[0]?.name || 'Unknown',
          latitude: eventLat,
          longitude: eventLng,
          price: event.priceRanges?.[0]
            ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}`
            : undefined,
          category: event.classifications,
          images: event.images || [],
          popularity: event?.popularity || 0,
          rank: event?.rank || 0,
          distance: parseFloat(distanceKm.toFixed(2)) || 0, // now per-event
          source: 'ticketmaster'
        };
      })
    );
  },

  async formatPredictHQData(events: any[]): Promise<EventItem[]> {

  return Promise.all(
    events.map(async (event) => {
      // PredictHQ uses [lng, lat] order in event.location
      const eventLat = parseFloat(event.location?.[1] ?? '0');
      const eventLng = parseFloat(event.location?.[0] ?? '0');

      // Per-event distance calculation
      const distanceKm =
        (await LocationService.getDistanceKm(eventLat, eventLng)) || 0;

      return {
        id: `phq_${event.id}`,
        title: event.title,
        description: event.description || '',
        date: event.start.split('T')[0], // Extract yyyy-mm-dd
        location: event.entities?.[0]?.name || 'Unknown',
        latitude: eventLat,
        longitude: eventLng,
        price: event?.price || 0,
        category: [],
        images: event?.images || [],
        popularity: event?.popularity || 0,
        rank: event.rank || 0,
        distance: parseFloat(distanceKm.toFixed(2)) || 0, // per-event distance
        source: 'predicthq'
      };
    })
  );
}

}
