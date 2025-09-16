import { defineStore } from 'pinia';
import { EventItem } from '@/types/EventItem';
import { apiService } from '@/services/api/apiService';

interface EventState {
  events: EventItem[];
  loading: boolean;
  filters: {
    keyword: string;
    dateRange?: [string, string];
  };
}

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    events: [],
    loading: false,
    filters: { keyword: '' }
  }),
  actions: {
    async fetchEvents(page = 0, size = 20) {
      this.loading = true;
      try {
        const data = await apiService.getCombinedEvents(this.filters.keyword, page, size);
        this.events = data;
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        this.loading = false;
      }
    },
    setKeyword(keyword: string) {
      this.filters.keyword = keyword;
    },
    clearEvents() {
      this.events = [];
    }
  },
  getters: {
    totalEvents: (state) => state.events.length
  }
});
