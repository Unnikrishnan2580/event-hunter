# event-hunter
Demo Ionic 7 Vue mobile app for getting near by events.

# Ionic 7 + Vue Mobile App

## Setup Instructions

1.  **Clone the Repository**

    ``` bash
    git clone <your-repo-url>
    cd <your-project-folder>
    ```

2.  **Install Dependencies**

    ``` bash
    npm install
    ```

3.  **Capacitor Setup** Add native platforms:

    ``` bash
    npx cap add ios
    npx cap add android
    ```

4.  **Run the App** For development:

    ``` bash
    ionic serve
    ```

    For native:

    ``` bash
    ionic build
    npx cap sync
    npx cap run ios   # or android
    ```

## API Keys Configuration

-   **Ticketmaster API Key** and **PredictHQ API Key** must be set in an
    `.env` file:
    `VITE_TICKETMASTER_KEY=your_ticketmaster_key  VITE_PREDICTHQ_KEY=your_predicthq_key`
-   Access them in code via `import.meta.env.VITE_TICKETMASTER_KEY`.

## Architecture Decisions

-   **State Management**: Uses Vue's Composition API with reactive
    variables and `provide/inject` for lightweight global state.
-   **API Layer**: Centralized `apiService` wrapping CapacitorHttp for
    Ticketmaster & PredictHQ. Combines and normalizes responses.
-   **Offline Strategy**: Network status monitoring with action sheets
    to prompt user to enable connectivity; caching key API responses in
    localStorage for fallback.
-   **Performance Optimizations**: Lazy-loaded routes, on-demand
    modal/action-sheet imports, and minimal bundle size using Ionic's
    tree-shaking.

## Known Limitations

-   No built-in pagination caching for very large datasets.
-   PredictHQ free plan may throttle requests.
-   Offline mode only supports previously cached events.

## Future Improvements

-   Implement advanced state management with Pinia for complex state.
-   Add automated testing (unit & E2E).
-   Introduce push notifications for real-time event updates.
-   Enhance offline support using IndexedDB for more robust data
    caching.
