/**
 * Main Application Entry Point
 * Danish Producer Directory
 */

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  /**
   * Initialize the application
   */
  async init() {
    console.log('Danish Producer Directory initializing...');

    // Load user preferences
    this.loadPreferences();

    // Initialize data loader (load companies and filters from JSON)
    await DataLoader.init();

    // Initialize filters with loaded data
    Filters.init();

    // Setup event listeners
    this.setupEventListeners();

    // Check for URL parameters (deep linking)
    this.handleUrlParams();

    console.log('App initialized successfully');
    console.log(`Loaded ${DataLoader.getCompanies().length} companies`);
  },

  /**
   * Load user preferences from storage
   */
  loadPreferences() {
    const prefs = Storage.getUserPrefs();

    // Apply theme
    if (prefs.theme) {
      document.documentElement.setAttribute('data-theme', prefs.theme);
    }

    // Apply default location if set
    if (prefs.defaultLocation) {
      const locationInput = document.getElementById('location');
      if (locationInput) locationInput.value = prefs.defaultLocation;
    }

    if (prefs.defaultDistance) {
      const distanceSelect = document.getElementById('distance');
      if (distanceSelect) distanceSelect.value = prefs.defaultDistance;
    }
  },

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('search-query')?.value?.trim();
        if (query) {
          Search.search(query);
        }
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('company-modal');
        if (modal) modal.close();
      });
    });

    // Close modal on backdrop click
    const modal = document.getElementById('company-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.close();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // ESC to close modal
      if (e.key === 'Escape') {
        const modal = document.getElementById('company-modal');
        if (modal?.open) modal.close();
      }

      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-query')?.focus();
      }
    });

    // Save location preference when changed
    const locationInput = document.getElementById('location');
    const distanceSelect = document.getElementById('distance');

    if (locationInput) {
      locationInput.addEventListener('change', () => {
        const prefs = Storage.getUserPrefs();
        prefs.defaultLocation = locationInput.value;
        Storage.saveUserPrefs(prefs);
      });
    }

    if (distanceSelect) {
      distanceSelect.addEventListener('change', () => {
        const prefs = Storage.getUserPrefs();
        prefs.defaultDistance = distanceSelect.value;
        Storage.saveUserPrefs(prefs);
      });
    }
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);

    // Save preference
    const prefs = Storage.getUserPrefs();
    prefs.theme = newTheme;
    Storage.saveUserPrefs(prefs);
  },

  /**
   * Handle URL parameters for deep linking
   */
  handleUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const query = params.get('q') || params.get('query');
    if (query) {
      const searchInput = document.getElementById('search-query');
      if (searchInput) {
        searchInput.value = query;
        Search.search(query);
      }
    }

    const location = params.get('location');
    if (location) {
      const locationInput = document.getElementById('location');
      if (locationInput) locationInput.value = location;
    }

    const distance = params.get('distance');
    if (distance) {
      const distanceSelect = document.getElementById('distance');
      if (distanceSelect) distanceSelect.value = distance;
    }
  },

  /**
   * Generate shareable URL with current search state
   */
  getShareableUrl() {
    const query = document.getElementById('search-query')?.value;
    const location = document.getElementById('location')?.value;
    const distance = document.getElementById('distance')?.value;

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    if (distance) params.set('distance', distance);

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Search, Filters, Storage };
}
