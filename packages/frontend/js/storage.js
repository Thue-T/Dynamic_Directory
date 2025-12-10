/**
 * Storage module for Danish Producer Directory
 * Handles local storage for companies, filters, and analytics
 */

const Storage = {
  /**
   * Get item from localStorage with JSON parsing
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn(`Storage.get error for ${key}:`, e);
      return null;
    }
  },

  /**
   * Set item in localStorage with JSON stringification
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Storage.set error for ${key}:`, e);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get companies from storage
   */
  getCompanies() {
    return this.get(CONFIG.storage.companies) || [];
  },

  /**
   * Save companies to storage
   */
  saveCompanies(companies) {
    return this.set(CONFIG.storage.companies, companies);
  },

  /**
   * Get dynamic filters configuration
   * These evolve over time based on discovered data
   */
  getFilters() {
    return this.get(CONFIG.storage.filters) || {
      // Default filter structure - will grow as we discover more parameters
      parameters: [],
      popularity: {}, // Track which filters are used most
      lastUpdated: null
    };
  },

  /**
   * Save filters configuration
   */
  saveFilters(filters) {
    filters.lastUpdated = new Date().toISOString();
    return this.set(CONFIG.storage.filters, filters);
  },

  /**
   * Add or update a filter parameter
   * This is how filters evolve over time
   */
  addFilterParameter(param) {
    const filters = this.getFilters();
    const existing = filters.parameters.find(p => p.id === param.id);

    if (existing) {
      // Update existing parameter
      Object.assign(existing, param);
      existing.occurrences = (existing.occurrences || 0) + 1;
    } else {
      // Add new parameter
      filters.parameters.push({
        ...param,
        occurrences: 1,
        addedAt: new Date().toISOString()
      });
    }

    this.saveFilters(filters);
    return filters;
  },

  /**
   * Track filter usage for prioritization
   */
  trackFilterUsage(filterId) {
    const filters = this.getFilters();
    filters.popularity[filterId] = (filters.popularity[filterId] || 0) + 1;
    this.saveFilters(filters);
  },

  /**
   * Get search history
   */
  getSearchHistory() {
    return this.get(CONFIG.storage.searchHistory) || [];
  },

  /**
   * Add search to history
   */
  addSearchHistory(search) {
    const history = this.getSearchHistory();
    history.unshift({
      ...search,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 searches
    if (history.length > 50) history.pop();
    this.set(CONFIG.storage.searchHistory, history);
  },

  /**
   * Get analytics data
   */
  getAnalytics() {
    return this.get(CONFIG.storage.analytics) || {
      searches: [],
      clicks: [],
      contacts: [],
      parameterSuccess: {} // Track which parameters lead to contacts
    };
  },

  /**
   * Track a search event
   */
  trackSearch(query, filters, resultCount) {
    if (!CONFIG.analytics.enabled) return;

    const analytics = this.getAnalytics();
    analytics.searches.push({
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 searches
    if (analytics.searches.length > 100) analytics.searches.shift();
    this.set(CONFIG.storage.analytics, analytics);
  },

  /**
   * Track a company click
   */
  trackClick(companyId, searchQuery) {
    if (!CONFIG.analytics.enabled || !CONFIG.analytics.trackClicks) return;

    const analytics = this.getAnalytics();
    analytics.clicks.push({
      companyId,
      searchQuery,
      timestamp: new Date().toISOString()
    });
    if (analytics.clicks.length > 200) analytics.clicks.shift();
    this.set(CONFIG.storage.analytics, analytics);
  },

  /**
   * Track a contact action (highest value event)
   * This helps determine which parameters are most valuable
   */
  trackContact(companyId, companyCapabilities) {
    if (!CONFIG.analytics.enabled || !CONFIG.analytics.trackContacts) return;

    const analytics = this.getAnalytics();
    analytics.contacts.push({
      companyId,
      capabilities: companyCapabilities,
      timestamp: new Date().toISOString()
    });

    // Update parameter success scores
    if (companyCapabilities) {
      Object.keys(companyCapabilities).forEach(param => {
        analytics.parameterSuccess[param] = (analytics.parameterSuccess[param] || 0) + 1;
      });
    }

    this.set(CONFIG.storage.analytics, analytics);
  },

  /**
   * Get most successful parameters (for prioritizing filters)
   */
  getSuccessfulParameters() {
    const analytics = this.getAnalytics();
    return Object.entries(analytics.parameterSuccess)
      .sort((a, b) => b[1] - a[1])
      .map(([param, score]) => ({ param, score }));
  },

  /**
   * Get user preferences
   */
  getUserPrefs() {
    return this.get(CONFIG.storage.userPrefs) || {
      theme: 'light',
      defaultLocation: null,
      defaultDistance: null
    };
  },

  /**
   * Save user preferences
   */
  saveUserPrefs(prefs) {
    return this.set(CONFIG.storage.userPrefs, prefs);
  }
};
