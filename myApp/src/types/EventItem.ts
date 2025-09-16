export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price?: string;
  latitude?: string;
  longitude?: string;
  category?: string;
  images?: string[];
  rank?: string;
  bookmarkType: string;
  distance: string;
  popularity: string;
  source?: string;
}
