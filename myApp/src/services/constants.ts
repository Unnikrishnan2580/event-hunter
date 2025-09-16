
// src/services/constants.ts
export const APP_CONSTANTS = {
    TM_BASE_URL: import.meta.env.VITE_TICKETMASTER_API_BASE_URL as string, 
    TM_API_KEY: import.meta.env.VITE_TICKETMASTER_API_KEY as string, 
    PAGE_SIZE: import.meta.env.VITE_TICKETMASTER_PAGE_SIZE as number, 
    PHQ_BASE_URL: import.meta.env.VITE_PREDICTHQ_API_BASE_URL as string,
    PHQ_API_KEY: import.meta.env.VITE_PREDICTHQ_API_KEY as number,
    DEFAULT_IMAGE: import.meta.env.VITE_TICKETMASTER_DEFAULT_IMAGE as string,
}
