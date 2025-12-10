/**
 * Configuration for Danish Producer Directory
 * This file contains API endpoints and app settings
 */

const CONFIG = {
  // API Configuration
  // In production, this will point to your n8n webhook URL via Cloudflare Tunnel
  // For development/testing, we'll use local mock data
  api: {
    // Set to your n8n webhook URL when deployed
    // e.g., 'https://api.yourdomain.com/webhook/search'
    baseUrl: null, // null = use mock data
    searchEndpoint: '/webhook/search',
    feedbackEndpoint: '/webhook/feedback',
    timeout: 30000 // 30 seconds
  },

  // Search settings
  search: {
    minQueryLength: 3,
    maxResults: 20,
    debounceMs: 300
  },

  // Location settings (Denmark-focused)
  location: {
    defaultCountry: 'Denmark',
    defaultCenter: { lat: 55.6761, lng: 12.5683 }, // Copenhagen
    maxDistanceKm: 500
  },

  // Analytics - track which parameters lead to successful matches
  analytics: {
    enabled: true,
    trackClicks: true,
    trackContacts: true,
    storageKey: 'dpd_analytics'
  },

  // Local storage keys
  storage: {
    companies: 'dpd_companies',
    filters: 'dpd_filters',
    searchHistory: 'dpd_search_history',
    userPrefs: 'dpd_user_prefs'
  },

  // Development mode
  dev: {
    useMockData: true, // Set to false when backend is ready
    logLevel: 'debug' // 'debug', 'info', 'warn', 'error'
  }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.api);
Object.freeze(CONFIG.search);
Object.freeze(CONFIG.location);
Object.freeze(CONFIG.analytics);
Object.freeze(CONFIG.storage);
Object.freeze(CONFIG.dev);
