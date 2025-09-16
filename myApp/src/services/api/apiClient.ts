// src/services/apiClient.ts
import { CapacitorHttp } from '@capacitor/core'
import { APP_CONSTANTS } from '../constants'
import { showErrorToast } from '@/utils/toast';

const TM_BASE_URL = APP_CONSTANTS.TM_BASE_URL;
const TM_API_KEY = APP_CONSTANTS.TM_API_KEY;

const PHQ_BASE_URL = APP_CONSTANTS.PHQ_BASE_URL;
const PHQ_API_KEY = APP_CONSTANTS.PHQ_API_KEY;


// --- Ticketmaster GET ---
export async function apiGet<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> {
  const res = await CapacitorHttp.get({
    url: `${TM_BASE_URL}${endpoint}`,
    params: { ...params, apikey: TM_API_KEY },
    headers: { Accept: 'application/json' }
  })

  if (res.status !== 200) {
    // showErrorToast(`Status: ${res.status}, ${t('errorMessages.ticketmasterAPIError')}`);
    showErrorToast("Unable to load Events from ticketmaster API");
    throw new Error(`Ticketmaster API error: ${res.status} – ${res.data || 'No details'}`)
  }

  return res.data as T
}

// --- Ticketmaster POST ---
export async function apiPost<T>(
  endpoint: string,
  body: Record<string, any>,
  params: Record<string, any> = {}
): Promise<T> {
  const res = await CapacitorHttp.post({
    url: `${TM_BASE_URL}${endpoint}`,
    params: { ...params, apikey: TM_API_KEY },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    data: body
  })

  if (res.status < 200 || res.status >= 300) {
    showErrorToast("Unable to load Events from backend API")
    // showErrorToast(`Status: ${res.status}, ${t('errorMessages.APIError')}`);
    throw new Error(`API POST error: ${res.status} – ${res.data || 'No details'}`)
  }

  return res.data as T
}

// --- PredictHQ GET ---
export async function apiGetPredictHQ<T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T> {
  const res = await CapacitorHttp.get({
    url: `${PHQ_BASE_URL}${endpoint}`,
    params,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${PHQ_API_KEY}`
    }
  })

  if (res.status !== 200) {
    showErrorToast("Unable to load Events from PredictHQ API");
    // showErrorToast("Status ${res.status}m ${t('errorMessages.predictHQAPIError')}");
    throw new Error(`PredictHQ API error: ${res.status} – ${res.data || 'No details'}`)
  }

  return res.data as T
}
