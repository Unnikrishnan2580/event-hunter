// src/services/apiClient.ts
import { CapacitorHttp } from '@capacitor/core'

const TM_BASE_URL = 'https://app.ticketmaster.com/discovery/v2'
const TM_API_KEY = 'S7ZmuMWGY7k5qbx3zXlhli7f1VTWi4no'

const PHQ_BASE_URL = 'https://api.predicthq.com/v1'
const PHQ_API_KEY = 'KWiwlYHm-So7r4ED2ejIvRoM6fhu4sq-4uw4URDJ'

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
    throw new Error(`PredictHQ API error: ${res.status} – ${res.data || 'No details'}`)
  }

  return res.data as T
}
