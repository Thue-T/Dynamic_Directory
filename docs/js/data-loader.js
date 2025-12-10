/**
 * Data Loader Module
 * Loads company data from JSON files for the frontend
 * In production, this will be replaced with API calls to n8n
 */

const DataLoader = {
  companiesData: null,
  filtersData: null,

  /**
   * Initialize data loader - load from JSON files or localStorage
   */
  async init() {
    try {
      // Try to load from localStorage first (for faster subsequent loads)
      const cachedCompanies = Storage.getCompanies();
      const cachedFilters = Storage.getFilters();

      if (cachedCompanies && cachedCompanies.length > 0) {
        this.companiesData = cachedCompanies;
        console.log(`Loaded ${cachedCompanies.length} companies from cache`);
      } else {
        // Load from JSON file
        await this.loadCompaniesFromFile();
      }

      if (cachedFilters && cachedFilters.parameters && cachedFilters.parameters.length > 0) {
        this.filtersData = cachedFilters;
        console.log(`Loaded ${cachedFilters.parameters.length} filters from cache`);
      } else {
        // Load from JSON file
        await this.loadFiltersFromFile();
      }

      return true;
    } catch (error) {
      console.error('DataLoader init error:', error);
      // Fall back to mock data
      this.companiesData = Search.getMockCompanies();
      return false;
    }
  },

  /**
   * Load companies from JSON file
   */
  async loadCompaniesFromFile() {
    try {
      // In GitHub Pages, data is in the same folder structure
      const response = await fetch('./data/companies/companies.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.companiesData = data.companies || [];

      // Cache to localStorage
      Storage.saveCompanies(this.companiesData);

      console.log(`Loaded ${this.companiesData.length} companies from file`);
      return this.companiesData;
    } catch (error) {
      console.warn('Could not load companies from file:', error);
      // Will use mock data as fallback
      return null;
    }
  },

  /**
   * Load filters from JSON file
   */
  async loadFiltersFromFile() {
    try {
      const response = await fetch('./data/schemas/initial-filters.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.filtersData = await response.json();

      // Cache to localStorage
      Storage.saveFilters(this.filtersData);

      console.log(`Loaded ${this.filtersData.parameters?.length || 0} filters from file`);
      return this.filtersData;
    } catch (error) {
      console.warn('Could not load filters from file:', error);
      return null;
    }
  },

  /**
   * Get all companies
   */
  getCompanies() {
    return this.companiesData || [];
  },

  /**
   * Get company by ID
   */
  getCompanyById(id) {
    return this.companiesData?.find(c => c.id === id) || null;
  },

  /**
   * Search companies locally (when no backend available)
   */
  searchCompanies(query, filters = {}) {
    const companies = this.getCompanies();
    if (!companies || companies.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);

    return companies
      .map(company => {
        const score = this.calculateSearchScore(company, queryWords, filters);
        return { ...company, matchScore: score };
      })
      .filter(company => company.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Calculate search score for a company
   */
  calculateSearchScore(company, queryWords, filters) {
    let score = 0;

    // Build searchable text from company data
    const searchableFields = [
      company.name,
      company.description,
      company.address?.city,
      company.address?.region,
      company.industry?.primaryIndustry,
      ...(company.industry?.subIndustries || []),
      ...(company.capabilities?.processes || []),
      ...(company.capabilities?.materials || []),
      ...(company.certifications || [])
    ];

    const searchableText = searchableFields
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Score based on query word matches
    queryWords.forEach(word => {
      if (searchableText.includes(word)) {
        score += 15;

        // Bonus for name match
        if (company.name?.toLowerCase().includes(word)) {
          score += 10;
        }

        // Bonus for process match
        if (company.capabilities?.processes?.some(p => p.toLowerCase().includes(word))) {
          score += 8;
        }

        // Bonus for material match
        if (company.capabilities?.materials?.some(m => m.toLowerCase().includes(word))) {
          score += 8;
        }
      }
    });

    // Apply filter penalties/bonuses
    if (filters.materials && filters.materials.length > 0) {
      const companyMaterials = (company.capabilities?.materials || [])
        .map(m => m.toLowerCase().replace(/\s+/g, '_'));

      const matches = filters.materials.filter(f =>
        companyMaterials.some(m => m.includes(f.replace(/_/g, ' ')) || m.includes(f))
      );

      if (matches.length > 0) {
        score += matches.length * 10;
      } else {
        score -= 20; // Penalty for not matching filter
      }
    }

    if (filters.processes && filters.processes.length > 0) {
      const companyProcesses = (company.capabilities?.processes || [])
        .map(p => p.toLowerCase().replace(/\s+/g, '_'));

      const matches = filters.processes.filter(f =>
        companyProcesses.some(p => p.includes(f.replace(/_/g, ' ')) || p.includes(f))
      );

      if (matches.length > 0) {
        score += matches.length * 10;
      } else {
        score -= 20;
      }
    }

    if (filters.certifications && filters.certifications.length > 0) {
      const companyCerts = (company.certifications || [])
        .map(c => c.toLowerCase().replace(/\s+/g, '_'));

      const matches = filters.certifications.filter(f =>
        companyCerts.some(c => c.includes(f.replace(/_/g, ' ')) || c.includes(f))
      );

      if (matches.length > 0) {
        score += matches.length * 15;
      }
    }

    // Bonus for having certifications
    if (company.certifications?.length > 0) {
      score += 5;
    }

    // Bonus for high confidence data
    if (company.source?.confidence > 0.8) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Get unique values for a capability field across all companies
   */
  getUniqueValues(field) {
    const companies = this.getCompanies();
    const values = new Set();

    companies.forEach(company => {
      const fieldValue = this.getNestedValue(company, field);
      if (Array.isArray(fieldValue)) {
        fieldValue.forEach(v => values.add(v));
      } else if (fieldValue) {
        values.add(fieldValue);
      }
    });

    return Array.from(values).sort();
  },

  /**
   * Get nested object value by dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  /**
   * Refresh data from source
   */
  async refresh() {
    // Clear cache
    Storage.remove(CONFIG.storage.companies);
    Storage.remove(CONFIG.storage.filters);

    // Reload
    await this.init();

    // Re-render filters
    Filters.loadAndRender();

    return true;
  }
};
