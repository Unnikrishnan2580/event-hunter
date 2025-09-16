// src/services/apiService.ts
import { EventItem } from '@/types/EventItem';
import { LocationService } from '../locationService';
import { apiGet, apiPost, apiGetPredictHQ } from './apiClient';
import { throttle } from '@/utils/rateLimiter';

/** Helper Functions (formatting events) **/

async function formatEventsData(events: any[]): Promise<EventItem[]> {
  return Promise.all(
    events.map(async (event) => {
      const eventLat = parseFloat(event._embedded?.venues?.[0]?.location?.latitude ?? '0');
      const eventLng = parseFloat(event._embedded?.venues?.[0]?.location?.longitude ?? '0');
      const distanceKm = (await LocationService.getDistanceKm(eventLat, eventLng)) || 0;

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
        distance: parseFloat(distanceKm.toFixed(2)) || 0,
        source: 'ticketmaster',
        bookmarkType: ''
      };
    })
  );
}

async function formatPredictHQData(events: any[]): Promise<EventItem[]> {
  return Promise.all(
    events.map(async (event) => {
      const eventLat = parseFloat(event.location?.[1] ?? '0');
      const eventLng = parseFloat(event.location?.[0] ?? '0');
      const distanceKm = (await LocationService.getDistanceKm(eventLat, eventLng)) || 0;

      return {
        id: `phq_${event.id}`,
        title: event.title,
        description: event.description || '',
        date: event.start.split('T')[0],
        location: event.entities?.[0]?.name || 'Unknown',
        latitude: eventLat,
        longitude: eventLng,
        price: event?.price || 0,
        category: [],
        images: event?.images || [],
        popularity: event?.popularity || 0,
        rank: event.rank || 0,
        distance: parseFloat(distanceKm.toFixed(2)) || 0,
        source: 'predicthq',
        bookmarkType: ''
      };
    })
  );
}

/** Throttled API Service **/

export const apiService = {
  // --- Ticketmaster Events ---
  getEvents: throttle(async (page = 0, size = 20, countryCode = 'US'): Promise<EventItem[]> => {
    const data = await apiGet<{ _embedded?: { events: any[] } }>('/events.json', {
      page,
      size,
      countryCode
    });
    const events = data._embedded?.events || [];
    return formatEventsData(events);
  }, 1000),

  // --- Event details ---
  getEventDetails: throttle(async (id: string) => {
    return apiGet(`/${id}.json`);
  }, 500),

  // --- Feedback ---
  sendFeedback: throttle(async (feedback: { name: string; message: string }) => {
    return apiPost('/feedback', feedback);
  }, 2000),

  // --- Search by keyword ---
  searchEventsByKeyword: throttle(async (keyword: string, page = 0, size = 20) => {
    if (!keyword) return [];

    const tmData = await apiGet<{ _embedded?: { events: any[] } }>('/events.json', {
      keyword,
      page,
      size
    });
    const events = tmData._embedded?.events || [];
    return formatEventsData(events);
  }, 1000),

  // --- Combined Ticketmaster + PredictHQ ---
  getCombinedEvents: throttle(async (keyword = '', page = 0, size = 20): Promise<EventItem[]> => {
    // Ticketmaster
    const tmData = await apiGet<{ _embedded?: { events: any[] } }>('/events.json', {
      keyword,
      page,
      size
    });
    const tmEvents = await formatEventsData(tmData._embedded?.events || []);

    // PredictHQ
    const phqData = await apiGetPredictHQ<{ results: any[] }>('/events/', {
      q: keyword,
      limit: size
    });
    const phqEvents = await formatPredictHQData(phqData.results || []);

    // Merge & return
    return [...tmEvents, ...phqEvents];
  }, 1500)
};
