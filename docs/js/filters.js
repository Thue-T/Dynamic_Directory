/**
 * Dynamic Filters Module for Danish Producer Directory
 *
 * This module handles the self-evolving filter system.
 * Filters are added/prioritized based on:
 * 1. Data discovered from company profiles
 * 2. User search patterns
 * 3. Conversion rates (which filters lead to contacts)
 */

const Filters = {
  /**
   * Initialize filters from storage and render them
   */
  init() {
    this.loadAndRender();
  },

  /**
   * Load filters from storage and render to DOM
   */
  loadAndRender() {
    const filters = Storage.getFilters();
    const container = document.getElementById('filter-container');
    const wrapper = document.getElementById('dynamic-filters');

    if (!container || !wrapper) return;

    // Only show if we have parameters
    if (filters.parameters.length === 0) {
      wrapper.style.display = 'none';
      return;
    }

    // Sort parameters by usage/success
    const sortedParams = this.prioritizeParameters(filters.parameters);

    // Render filter UI
    container.innerHTML = sortedParams.map(param => this.renderFilter(param)).join('');

    // Show the filters section
    wrapper.style.display = 'block';

    // Attach event listeners
    this.attachListeners();
  },

  /**
   * Prioritize parameters based on success metrics
   */
  prioritizeParameters(parameters) {
    const successMetrics = Storage.getSuccessfulParameters();
    const successMap = new Map(successMetrics.map(s => [s.param, s.score]));

    return [...parameters].sort((a, b) => {
      const scoreA = successMap.get(a.id) || 0;
      const scoreB = successMap.get(b.id) || 0;

      // Primary: success score
      if (scoreB !== scoreA) return scoreB - scoreA;

      // Secondary: occurrence count
      return (b.occurrences || 0) - (a.occurrences || 0);
    });
  },

  /**
   * Render a single filter based on its type
   */
  renderFilter(param) {
    switch (param.type) {
      case 'range':
        return this.renderRangeFilter(param);
      case 'select':
        return this.renderSelectFilter(param);
      case 'multiselect':
        return this.renderMultiSelectFilter(param);
      case 'boolean':
        return this.renderBooleanFilter(param);
      default:
        return '';
    }
  },

  /**
   * Render a range filter (e.g., thickness: 0-50mm)
   */
  renderRangeFilter(param) {
    return `
      <div class="filter-group" data-filter-id="${param.id}">
        <label>
          ${param.label}
          ${param.unit ? `<small>(${param.unit})</small>` : ''}
        </label>
        <div class="filter-range">
          <input
            type="number"
            name="${param.id}_min"
            placeholder="Min"
            min="${param.min || 0}"
            max="${param.max || ''}"
            step="${param.step || 1}"
          >
          <span>to</span>
          <input
            type="number"
            name="${param.id}_max"
            placeholder="Max"
            min="${param.min || 0}"
            max="${param.max || ''}"
            step="${param.step || 1}"
          >
        </div>
      </div>
    `;
  },

  /**
   * Render a select filter (e.g., material type)
   */
  renderSelectFilter(param) {
    const options = (param.options || [])
      .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');

    return `
      <div class="filter-group" data-filter-id="${param.id}">
        <label for="filter-${param.id}">${param.label}</label>
        <select id="filter-${param.id}" name="${param.id}">
          <option value="">Any</option>
          ${options}
        </select>
      </div>
    `;
  },

  /**
   * Render a multi-select filter (e.g., certifications)
   */
  renderMultiSelectFilter(param) {
    const checkboxes = (param.options || [])
      .map(opt => `
        <label>
          <input type="checkbox" name="${param.id}" value="${opt.value}">
          ${opt.label}
        </label>
      `)
      .join('');

    return `
      <div class="filter-group" data-filter-id="${param.id}">
        <label>${param.label}</label>
        <div class="checkbox-group">
          ${checkboxes}
        </div>
      </div>
    `;
  },

  /**
   * Render a boolean filter (e.g., "Has ISO 9001")
   */
  renderBooleanFilter(param) {
    return `
      <div class="filter-group" data-filter-id="${param.id}">
        <label>
          <input type="checkbox" name="${param.id}" role="switch">
          ${param.label}
        </label>
      </div>
    `;
  },

  /**
   * Attach event listeners to filter inputs
   */
  attachListeners() {
    const container = document.getElementById('filter-container');
    if (!container) return;

    container.addEventListener('change', (e) => {
      const filterGroup = e.target.closest('.filter-group');
      if (filterGroup) {
        const filterId = filterGroup.dataset.filterId;
        Storage.trackFilterUsage(filterId);
      }
    });
  },

  /**
   * Get current filter values from the form
   */
  getValues() {
    const container = document.getElementById('filter-container');
    if (!container) return {};

    const values = {};
    const filters = Storage.getFilters();

    filters.parameters.forEach(param => {
      switch (param.type) {
        case 'range':
          const minInput = container.querySelector(`[name="${param.id}_min"]`);
          const maxInput = container.querySelector(`[name="${param.id}_max"]`);
          if (minInput?.value || maxInput?.value) {
            values[param.id] = {
              min: minInput?.value ? parseFloat(minInput.value) : null,
              max: maxInput?.value ? parseFloat(maxInput.value) : null
            };
          }
          break;

        case 'select':
          const select = container.querySelector(`[name="${param.id}"]`);
          if (select?.value) {
            values[param.id] = select.value;
          }
          break;

        case 'multiselect':
          const checkboxes = container.querySelectorAll(`[name="${param.id}"]:checked`);
          if (checkboxes.length > 0) {
            values[param.id] = Array.from(checkboxes).map(cb => cb.value);
          }
          break;

        case 'boolean':
          const checkbox = container.querySelector(`[name="${param.id}"]`);
          if (checkbox?.checked) {
            values[param.id] = true;
          }
          break;
      }
    });

    return values;
  },

  /**
   * Clear all filter values
   */
  clear() {
    const container = document.getElementById('filter-container');
    if (!container) return;

    container.querySelectorAll('input, select').forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  },

  /**
   * Add a new parameter discovered from company data
   * This is how the system evolves over time
   */
  discoverParameter(param) {
    // Validate parameter structure
    if (!param.id || !param.label || !param.type) {
      console.warn('Invalid parameter structure:', param);
      return;
    }

    // Add to storage
    Storage.addFilterParameter(param);

    // Re-render filters
    this.loadAndRender();

    if (CONFIG.dev.logLevel === 'debug') {
      console.log('Discovered new parameter:', param);
    }
  },

  /**
   * Discover parameters from company data
   * Called when new companies are added to learn their parameters
   */
  discoverFromCompanyData(company) {
    if (!company.capabilities) return;

    // Example: Discover thickness parameter from welding capabilities
    if (company.capabilities.welding?.maxThickness) {
      this.discoverParameter({
        id: 'welding_thickness',
        label: 'Welding Thickness',
        type: 'range',
        unit: 'mm',
        min: 0,
        max: 100,
        step: 1,
        category: 'welding'
      });
    }

    // Example: Discover material types
    if (company.capabilities.materials && company.capabilities.materials.length > 0) {
      const existingFilter = Storage.getFilters().parameters.find(p => p.id === 'materials');
      const newOptions = company.capabilities.materials.map(m => ({
        value: m.toLowerCase().replace(/\s+/g, '_'),
        label: m
      }));

      if (existingFilter) {
        // Merge new options with existing
        const existingValues = new Set(existingFilter.options.map(o => o.value));
        newOptions.forEach(opt => {
          if (!existingValues.has(opt.value)) {
            existingFilter.options.push(opt);
          }
        });
        Storage.addFilterParameter(existingFilter);
      } else {
        this.discoverParameter({
          id: 'materials',
          label: 'Materials',
          type: 'multiselect',
          options: newOptions,
          category: 'general'
        });
      }
    }

    // Example: Discover certifications
    if (company.certifications && company.certifications.length > 0) {
      const existingFilter = Storage.getFilters().parameters.find(p => p.id === 'certifications');
      const newOptions = company.certifications.map(c => ({
        value: c.toLowerCase().replace(/\s+/g, '_'),
        label: c
      }));

      if (existingFilter) {
        const existingValues = new Set(existingFilter.options.map(o => o.value));
        newOptions.forEach(opt => {
          if (!existingValues.has(opt.value)) {
            existingFilter.options.push(opt);
          }
        });
        Storage.addFilterParameter(existingFilter);
      } else {
        this.discoverParameter({
          id: 'certifications',
          label: 'Certifications',
          type: 'multiselect',
          options: newOptions,
          category: 'quality'
        });
      }
    }
  }
};
